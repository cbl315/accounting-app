import { create } from 'zustand'
import { database } from '../db'
import { Q } from '@nozbe/watermelondb'

const PRESET_CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']

const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,
  categories: PRESET_CATEGORIES,

  // 获取所有交易
  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const result = await database.collections
        .get('transactions')
        .query()
        .fetch()
      
      if (!result || !result._array) {
        throw new Error('No transactions found')
      }

      set({ 
        transactions: result._array.map(t => ({
          id: t._raw.id,
          amount: t._raw.amount,
          type: t._raw.type,
          category: t._raw.category,
          date: t._raw.date,
          memo: t._raw.memo || '',
          imageUri: t._raw.image_uri || null
        })),
        loading: false 
      })
      return result._array
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch transactions'
      set({ 
        error: errorMessage, 
        loading: false,
        transactions: []
      })
      throw err
    }
  },

  // 添加新交易
  addTransaction: async (transactionData) => {
    if (!transactionData || 
        typeof transactionData.amount !== 'number' ||
        !['income', 'expense'].includes(transactionData.type) ||
        typeof transactionData.category !== 'string' ||
        !transactionData.date) {
      throw new Error('Invalid transaction data')
    }

    // 处理图片数据
    if (transactionData.imageUri && transactionData.imageUri.startsWith('data:')) {
      transactionData.imageUri = transactionData.imageUri.split(',')[1];
    }

    set({ loading: true })
    try {
      await database.write(async () => {
        await database.collections
          .get('transactions')
          .create((t) => {
            t.amount = transactionData.amount
            t.type = transactionData.type
            t.category = transactionData.category
            t.date = transactionData.date
            t.memo = transactionData.memo
            t.imageUri = transactionData.imageUri
          })
      })
      set({ loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // 删除交易
  deleteTransaction: async (id) => {
    set({ loading: true })
    try {
      const transaction = await database.collections
        .get('transactions')
        .find(id)

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      await database.write(async () => {
        await transaction.markAsDeleted()
      })
      
      // Refresh transactions list
      await useTransactionStore.getState().fetchTransactions()
      set({ loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // 导出交易数据为JSON
  exportToJSON: async () => {
    set({ loading: true })
    try {
      const transactions = await database.collections
        .get('transactions')
        .query()
        .fetch()

      if (!transactions || !transactions._array) {
        throw new Error('No transactions found')
      }

      const exportData = transactions._array.map(t => ({
        id: t._raw.id,
        amount: t._raw.amount,
        type: t._raw.type,
        category: t._raw.category,
        date: t._raw.date,
        memo: t._raw.memo || '',
        imageUri: t._raw.image_uri || null
      }))
      return JSON.stringify(exportData)
    } catch (err) {
      set({ error: `Export failed: ${err.message}`, loading: false })
      throw err
    }
  },

  // 从JSON导入交易数据
  importFromJSON: async (jsonData) => {
    set({ loading: true })
    try {
      if (typeof jsonData !== 'string') {
        throw new Error('Invalid JSON data')
      }

      let data
      try {
        data = JSON.parse(jsonData)
      } catch (err) {
        throw new Error('Invalid JSON data')
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid transactions data')
      }

      await database.write(async () => {
        for (const item of data) {
          await database.collections
            .get('transactions')
            .create(t => {
              t.amount = item.amount
              t.type = item.type
              t.category = item.category
              t.date = item.date
              t.memo = item.memo || ''
              t.imageUri = item.imageUri || null
            })
        }
      })
      set({ loading: false })
    } catch (err) {
      set({ error: `Import failed: ${err.message}`, loading: false })
      throw err
    }
  },


  // 添加自定义分类
  addCategory: (category) => {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new Error('Invalid category name')
    }
    set((state) => ({
      categories: [...new Set([...state.categories, category])]
    }))
  },

  // 获取所有分类
  getCategories: () => {
    return useTransactionStore.getState().categories
  },

  // 按时间范围查询交易
  getTransactionsByDateRange: async (startDate, endDate) => {
    set({ loading: true })
    try {
      // Validate date format
      const isValidDate = (dateStr) => !isNaN(new Date(dateStr).getTime())
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Invalid date format')
      }

      // Convert to timestamps for WatermelonDB query
      const startTimestamp = new Date(startDate).getTime()
      const endTimestamp = new Date(endDate).getTime()

      const result = await database.collections
        .get('transactions')
        .query(
          Q.where('date', Q.between(startTimestamp, endTimestamp))
        )
        .fetch()

      if (!result || !result._array || result._array.length === 0) {
        throw new Error('No transactions found in date range')
      }

      set({
        transactions: result._array.map(t => ({
          id: t._raw.id,
          amount: t._raw.amount,
          type: t._raw.type,
          category: t._raw.category,
          date: t._raw.date,
          memo: t._raw.memo || '',
          imageUri: t._raw.image_uri || null
        })),
        loading: false
      })
      return result._array
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // 按分类统计金额
  getCategoryStats: async () => {
    set({ loading: true })
    try {
      const allTransactions = await database.collections
        .get('transactions')
        .query()
        .fetch()

      if (!allTransactions || !allTransactions._array || allTransactions._array.length === 0) {
        throw new Error('No transactions found')
      }

      const stats = {}
      allTransactions._array.forEach(t => {
        const category = t._raw.category
        const amount = parseFloat(t._raw.amount) || 0
        const type = t._raw.type

        if (!stats[category]) {
          stats[category] = { income: 0, expense: 0 }
        }
        stats[category][type] += amount
      })

      set({ loading: false })
      return stats
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // 处理OCR识别结果
  addOCRTransaction: async (ocrData) => {
    try {
      if (!ocrData || !ocrData.amount || !ocrData.type || !ocrData.category || !ocrData.date) {
        throw new Error('Missing required OCR data')
      }

      const amount = parseFloat(ocrData.amount)
      if (isNaN(amount)) {
        throw new Error('Invalid amount format')
      }

      const transaction = {
        amount,
        type: ocrData.type,
        category: ocrData.category,
        date: ocrData.date,
        imageUri: ocrData.imageUri || null
      }
      
      await useTransactionStore.getState().addTransaction(transaction)
      return transaction
    } catch (err) {
      set({ error: `OCR transaction error: ${err.message}` })
      throw err
    }
  },

  // 清理一年前的旧交易
  cleanupOldTransactions: async () => {
    set({ loading: true })
    try {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const timestamp = oneYearAgo.getTime()

      const oldTransactions = await database.collections
        .get('transactions')
        .query(
          Q.where('date', Q.lte(timestamp))
        )
        .fetch()

      if (oldTransactions && oldTransactions._array && oldTransactions._array.length > 0) {
        await database.write(async () => {
          for (const t of oldTransactions._array) {
            await t.markAsDeleted()
          }
        })
      }
      set({ loading: false })
    } catch (err) {
      set({ error: `Cleanup failed: ${err.message}`, loading: false })
      throw err
    }
  },

  // 验证图片
  validateImage: async (image) => {
    if (!image || !image.uri || !image.size || !image.type) {
      throw new Error('Invalid image data')
    }

    // 检查图片大小 (最大5MB)
    if (image.size > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB limit')
    }

    // 检查图片类型
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(image.type.toLowerCase())) {
      throw new Error('Only JPEG/PNG images are supported')
    }
  }
}))

export default useTransactionStore
