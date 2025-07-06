import { create } from 'zustand'
import { database } from '../db'

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
      
      if (!result) {
        throw new Error('Invalid transactions data')
      }
      const transactions = result._array || []

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
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch transactions'
      set({ 
        error: errorMessage, 
        loading: false,
        transactions: []
      })
      throw new Error(errorMessage)
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

      await database.write(async () => {
        await transaction.markAsDeleted()
      })
      set({ loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
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
  }
}))

export default useTransactionStore
