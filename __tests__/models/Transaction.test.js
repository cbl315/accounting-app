import Transaction from '../../src/models/Transaction'

describe('Transaction Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate correct transaction', () => {
    const t = new Transaction({
      amount: 100,
      type: 'expense',
      category: '餐饮',
      date: '2025-07-07'
    })
    expect(t.isValid).toBeTruthy()
  })

  it('should invalidate missing amount', () => {
    const t = new Transaction({
      type: 'income',
      category: '工资',
      date: '2025-07-07'
    })
    expect(t.isValid).toBeFalsy()
  })

  it('should invalidate wrong type', () => {
    const t = new Transaction({
      amount: 100,
      type: 'invalid',
      category: '其他',
      date: '2025-07-07'
    })
    expect(t.isValid).toBeFalsy()
  })

  it('should allow optional memo and image', () => {
    const t = new Transaction({
      amount: 100,
      type: 'expense',
      category: '交通',
      date: '2025-07-07',
      memo: '出租车费',
      imageUri: 'file://receipt.jpg'
    })
    expect(t.isValid).toBeTruthy()
  })

  it('should validate OCR transaction data', () => {
    const ocrData = {
      amount: 38.5,
      type: 'expense',
      category: '餐饮',
      date: '2025-07-06',
      imageUri: 'file://ocr_receipt.jpg'
    }
    const t = new Transaction(ocrData)
    expect(t.isValid).toBeTruthy()
  })

  it('should reject invalid OCR data', () => {
    const invalidOcrData = {
      amount: '38.5', // should be number
      type: 'expense',
      category: '餐饮',
      date: '2025-07-06'
    }
    const t = new Transaction(invalidOcrData)
    expect(t.isValid).toBeFalsy()
  })

  it('should handle date format variations', () => {
    const formats = [
      '2025-07-06',
      '2025/07/06',
      '06-07-2025'
    ]
    
    formats.forEach(date => {
      const t = new Transaction({
        amount: 100,
        type: 'expense',
        category: '交通',
        date
      })
      expect(t.isValid).toBeTruthy()
    })
  })
})
