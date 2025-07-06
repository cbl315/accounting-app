import useTransactionStore from '../../src/stores/useTransactionStore'
import { database } from '../../src/db'
import Transaction from '../../src/models/Transaction'

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
    database.collections.get().query().fetch.mockResolvedValue(mockTransactions)

    await useTransactionStore.getState().fetchTransactions()
    
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

  it('should handle fetch error', async () => {
    const error = new Error('Fetch failed')
    database.collections.get().query().fetch.mockRejectedValue(error)

    await useTransactionStore.getState().fetchTransactions()

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

  it('should delete transaction', async () => {
    const mockTransaction = {
      id: '1',
      _raw: {
        id: '1',
        amount: 100,
        type: 'expense',
        category: '餐饮',
        date: '2025-07-07'
      },
      markAsDeleted: jest.fn().mockImplementation(async function() {
        return Promise.resolve()
      }),
      prepareMarkAsDeleted: jest.fn().mockReturnThis(),
      collection: {
        database: {
          write: jest.fn(async (callback) => {
            await callback()
          })
        }
      },
      observe: jest.fn(),
      destroyPermanently: jest.fn(),
      update: jest.fn(),
      prepareUpdate: jest.fn(),
      prepareDestroyPermanently: jest.fn()
    }
    database.collections.get().find.mockResolvedValue(mockTransaction)
    database.write.mockImplementation(async (callback) => {
      await callback()
    })

    await useTransactionStore.getState().deleteTransaction('1')
    
    expect(database.write).toHaveBeenCalled()
    expect(mockTransaction.markAsDeleted).toHaveBeenCalled()
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
})
