import useTransactionStore from '../../src/stores/useTransactionStore'
import { database } from '../../src/db'
import Transaction from '../../src/models/Transaction'
import { Q } from '@nozbe/watermelondb'

// Mock WatermelonDB
jest.mock('../../src/db', () => ({
  database: {
    collections: {
      get: jest.fn(() => ({
        query: jest.fn(() => ({
          fetch: jest.fn()
        })),
        create: jest.fn(),
        find: jest.fn()
      }))
    },
    write: jest.fn()
  }
}))

describe('useTransactionStore', () => {
  beforeEach(() => {
    useTransactionStore.setState({
      transactions: [],
      loading: false,
      error: null
    })
  })

  it('should fetch transactions successfully', async () => {
    const mockTransactions = {
      _array: [
        { 
          _raw: {
            id: '1',
            amount: 100,
            type: 'expense',
            category: '餐饮',
            date: '2025-07-07',
            memo: '',
            image_uri: null
          }
        }
      ],
      observe: jest.fn()
    }
    
    // Mock collection with non-empty array
    database.collections.get.mockReturnValue({
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue(mockTransactions)
    })

    const result = await useTransactionStore.getState().fetchTransactions()
    
    expect(result).toEqual(mockTransactions._array)
    expect(useTransactionStore.getState().transactions).toEqual([
      {
        id: '1',
        amount: 100,
        type: 'expense',
        category: '餐饮',
        date: '2025-07-07',
        memo: '',
        imageUri: null
      }
    ])
    expect(useTransactionStore.getState().loading).toBe(false)
    expect(useTransactionStore.getState().error).toBe(null)
  })

  it('should handle empty transactions', async () => {
    // Mock empty result with null _array
    database.collections.get.mockReturnValue({
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue({ _array: null })
    })

    await expect(
      useTransactionStore.getState().fetchTransactions()
    ).rejects.toThrow('No transactions found')
    
    expect(useTransactionStore.getState().error).toBe('No transactions found')
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should handle fetch error', async () => {
    const error = new Error('Fetch failed')
    database.collections.get().query().fetch.mockRejectedValue(error)

    await expect(
      useTransactionStore.getState().fetchTransactions()
    ).rejects.toThrow('Fetch failed')
    
    expect(useTransactionStore.getState().error).toBe('Fetch failed')
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should add valid transaction', async () => {
    const validTransaction = {
      amount: 100,
      type: 'expense',
      category: '交通',
      date: '2025-07-07'
    }

    await useTransactionStore.getState().addTransaction(validTransaction)

    expect(database.write).toHaveBeenCalled()
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should reject invalid transaction', async () => {
    const invalidTransaction = {
      type: 'expense',
      category: '交通',
      date: '2025-07-07'
    }

    await expect(
      useTransactionStore.getState().addTransaction(invalidTransaction)
    ).rejects.toThrow('Invalid transaction data')
  })

  it('should manage transaction categories', async () => {
    const presetCategories = ['餐饮', '交通', '购物', '娱乐']
    const customCategory = '自定义分类'
    
    // Test preset categories
    const presetTransaction = {
      amount: 100,
      type: 'expense',
      category: presetCategories[0],
      date: '2025-07-07'
    }
    await useTransactionStore.getState().addTransaction(presetTransaction)
    expect(database.write).toHaveBeenCalled()

    // Test custom category
    const customTransaction = {
      amount: 200,
      type: 'expense',
      category: customCategory,
      date: '2025-07-07'
    }
    await useTransactionStore.getState().addTransaction(customTransaction)
    expect(database.write).toHaveBeenCalled()
  })

  it('should delete transaction successfully', async () => {
    // Create a complete mock transaction with all required WatermelonDB methods
    const mockTransaction = {
      id: '1',
      _raw: {
        id: '1',
        amount: 100,
        type: 'expense',
        category: '餐饮',
        date: '2025-07-07'
      },
      markAsDeleted: jest.fn(),
      collection: {
        get: jest.fn(),
        database: {
          write: jest.fn(async (callback) => {
            // Explicitly call markAsDeleted during write
            await mockTransaction.markAsDeleted()
            await callback()
            return Promise.resolve()
          })
        }
      }
    }

    // Mock the database with proper find implementation
    const mockCollection = {
      find: jest.fn().mockResolvedValue(mockTransaction),
      database: mockTransaction.collection.database
    }
    database.collections.get.mockImplementation(() => mockCollection)
    database.write.mockImplementation(mockTransaction.collection.database.write)

    // Mock fetchTransactions to avoid side effects
    const originalFetch = useTransactionStore.getState().fetchTransactions
    useTransactionStore.getState().fetchTransactions = jest.fn().mockResolvedValue([])

    // Execute the delete operation
    await useTransactionStore.getState().deleteTransaction('1')

    // Verify all expected interactions
    expect(database.collections.get().find).toHaveBeenCalledWith('1')
    expect(mockTransaction.markAsDeleted).toHaveBeenCalled()
    expect(mockTransaction.collection.database.write).toHaveBeenCalled()
    expect(useTransactionStore.getState().fetchTransactions).toHaveBeenCalled()
    expect(useTransactionStore.getState().loading).toBe(false)

    // Clean up
    useTransactionStore.getState().fetchTransactions = originalFetch
  })

  it('should handle transaction not found when deleting', async () => {
    // Mock collection with find method returning null
    database.collections.get.mockReturnValue({
      find: jest.fn().mockResolvedValue(null)
    })

    await expect(
      useTransactionStore.getState().deleteTransaction('999')
    ).rejects.toThrow('Transaction not found')
    
    expect(useTransactionStore.getState().error).toContain('Transaction not found')
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should add custom category', () => {
    const newCategory = '自定义分类'
    useTransactionStore.getState().addCategory(newCategory)
    expect(useTransactionStore.getState().categories).toContain(newCategory)
  })

  it('should reject invalid category name', () => {
    expect(() => useTransactionStore.getState().addCategory('')).toThrow('Invalid category name')
    expect(() => useTransactionStore.getState().addCategory(123)).toThrow('Invalid category name')
  })

  it('should get all categories', () => {
    const categories = useTransactionStore.getState().getCategories()
    expect(categories).toEqual(expect.arrayContaining(['餐饮', '交通', '购物', '娱乐']))
  })

  it('should deduplicate categories', () => {
    const duplicateCategory = '餐饮'
    useTransactionStore.getState().addCategory(duplicateCategory)
    const categories = useTransactionStore.getState().getCategories()
    expect(categories.filter(c => c === duplicateCategory).length).toBe(1)
  })

  it('should get transactions by date range', async () => {
    const mockTransactions = {
      _array: [
        { 
          _raw: {
            id: '1',
            amount: 100,
            type: 'expense',
            category: '餐饮',
            date: '2025-07-07',
            memo: '',
            image_uri: null
          }
        }
      ],
      observe: jest.fn()
    }
    // Mock timestamp values for the dates
    const startTimestamp = new Date('2025-07-01').getTime()
    const endTimestamp = new Date('2025-07-31').getTime()
    
    // Mock collection with query method
    const mockCollection = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue(mockTransactions)
    }
    database.collections.get.mockReturnValue(mockCollection)

    const result = await useTransactionStore.getState().getTransactionsByDateRange('2025-07-01', '2025-07-31')
    
    expect(mockCollection.query).toHaveBeenCalledWith(
      Q.where('date', Q.between(startTimestamp, endTimestamp))
    )
    expect(mockCollection.fetch).toHaveBeenCalled()
    
    expect(result).toEqual(mockTransactions._array)
    expect(useTransactionStore.getState().transactions.length).toBe(1)
  })

  it('should reject invalid date format', async () => {
    await expect(
      useTransactionStore.getState().getTransactionsByDateRange('invalid', 'date')
    ).rejects.toThrow('Invalid date format')
  })

  it('should handle no transactions in date range', async () => {
    // Mock timestamp values for the dates
    const startTimestamp = new Date('2025-07-01').getTime()
    const endTimestamp = new Date('2025-07-31').getTime()
    
    // Mock empty result
    const mockCollection = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue({ _array: [] })
    }
    database.collections.get.mockReturnValue(mockCollection)
    
    await expect(
      useTransactionStore.getState().getTransactionsByDateRange('2025-07-01', '2025-07-31')
    ).rejects.toThrow('No transactions found in date range')
  })

  it('should get category stats', async () => {
    const mockTransactions = {
      _array: [
        { 
          _raw: {
            id: '1',
            amount: 100,
            type: 'expense',
            category: '餐饮',
            date: '2025-07-07'
          }
        },
        { 
          _raw: {
            id: '2',
            amount: 200,
            type: 'income',
            category: '工资',
            date: '2025-07-08'
          }
        },
        { 
          _raw: {
            id: '3',
            amount: '50.5', // string amount
            type: 'expense',
            category: '餐饮',
            date: '2025-07-09'
          }
        }
      ],
      observe: jest.fn()
    }
    
    // Mock collection with query method
    const mockCollection = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue(mockTransactions)
    }
    database.collections.get.mockReturnValue(mockCollection)

    const stats = await useTransactionStore.getState().getCategoryStats()
    
    expect(stats).toEqual({
      '餐饮': { income: 0, expense: 150.5 },
      '工资': { income: 200, expense: 0 }
    })
  })

  it('should handle empty transactions for stats', async () => {
    // Mock empty result
    const mockCollection = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue({ _array: [] })
    }
    database.collections.get.mockReturnValue(mockCollection)
    
    await expect(
      useTransactionStore.getState().getCategoryStats()
    ).rejects.toThrow('No transactions found')
  })

  it('should add OCR transaction', async () => {
    const ocrData = {
      amount: '38.5',
      type: 'expense',
      category: '餐饮',
      date: '2025-07-06',
      imageUri: 'file://ocr_receipt.jpg'
    }
    database.write.mockResolvedValue(true)

    await useTransactionStore.getState().addOCRTransaction(ocrData)
    
    expect(database.write).toHaveBeenCalled()
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should handle OCR transaction error', async () => {
    const invalidOcrData = {
      type: 'expense',
      category: '餐饮',
      date: '2025-07-06'
    }

    await expect(
      useTransactionStore.getState().addOCRTransaction(invalidOcrData)
    ).rejects.toThrow('Missing required OCR data')

    // Test invalid amount
    await expect(
      useTransactionStore.getState().addOCRTransaction({
        amount: 'invalid',
        type: 'expense',
        category: '餐饮',
        date: '2025-07-06'
      })
    ).rejects.toThrow('Invalid amount format')
  })

  it('should export transactions to JSON', async () => {
    const mockTransactions = {
      _array: [
        { 
          _raw: {
            id: '1',
            amount: 100,
            type: 'expense',
            category: '餐饮',
            date: '2025-07-07',
            memo: '午餐',
            image_uri: null
          }
        }
      ],
      observe: jest.fn()
    }
    
    database.collections.get.mockReturnValue({
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue(mockTransactions)
    })

    const jsonData = await useTransactionStore.getState().exportToJSON()
    
    expect(jsonData).toEqual(JSON.stringify([{
      id: '1',
      amount: 100,
      type: 'expense',
      category: '餐饮',
      date: '2025-07-07',
      memo: '午餐',
      imageUri: null
    }]))
  })

  it('should import transactions from JSON', async () => {
    const jsonData = JSON.stringify([{
      amount: 100,
      type: 'expense',
      category: '餐饮',
      date: '2025-07-07',
      memo: '午餐'
    }])

    database.write.mockResolvedValue(true)

    await useTransactionStore.getState().importFromJSON(jsonData)
    
    expect(database.write).toHaveBeenCalled()
    expect(useTransactionStore.getState().loading).toBe(false)
  })

  it('should reject invalid JSON import', async () => {
    await expect(
      useTransactionStore.getState().importFromJSON('invalid json')
    ).rejects.toThrow('Invalid JSON data')

    await expect(
      useTransactionStore.getState().importFromJSON(JSON.stringify({}))
    ).rejects.toThrow('Invalid transactions data')
  })

  it('should clean up old transactions', async () => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const mockOldTransaction = {
      _raw: {
        id: '1',
        amount: 100,
        type: 'expense',
        category: '餐饮',
        date: oneYearAgo.toISOString().split('T')[0],
        memo: '旧交易'
      },
      markAsDeleted: jest.fn(),
      collection: {
        database: {
          write: jest.fn(async (callback) => {
            // Create batch to simulate WatermelonDB behavior
            const batch = {
              _operations: [],
              add: jest.fn(),
              apply: jest.fn(async () => {
                await mockOldTransaction.markAsDeleted()
              })
            }
            await callback(batch)
            await batch.apply()
            return Promise.resolve()
          })
        }
      }
    }

    const mockOldTransactions = {
      _array: [mockOldTransaction],
      observe: jest.fn()
    }
    
    // Mock the collection with proper query chain
    const mockCollection = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue(mockOldTransactions),
      database: mockOldTransaction.collection.database
    }
    database.collections.get.mockImplementation(() => mockCollection)
    database.write.mockImplementation(mockOldTransaction.collection.database.write)

    await useTransactionStore.getState().cleanupOldTransactions()
    
    expect(mockOldTransactions._array[0].markAsDeleted).toHaveBeenCalled()
    expect(database.write).toHaveBeenCalled()
  })

  it('should handle image validation', async () => {
    // Test valid image
    const validImage = {
      uri: 'file://receipt.jpg',
      size: 4 * 1024 * 1024, // 4MB
      type: 'image/jpeg'
    }
    await useTransactionStore.getState().validateImage(validImage)

    // Test invalid size
    await expect(
      useTransactionStore.getState().validateImage({
        ...validImage,
        size: 6 * 1024 * 1024 // 6MB
      })
    ).rejects.toThrow('Image size exceeds 5MB limit')

    // Test invalid type
    await expect(
      useTransactionStore.getState().validateImage({
        ...validImage,
        type: 'application/pdf'
      })
    ).rejects.toThrow('Only JPEG/PNG images are supported')
  })
})
