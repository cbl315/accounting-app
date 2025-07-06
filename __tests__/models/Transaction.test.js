import Transaction from '../../src/models/Transaction'

describe('Transaction Model', () => {
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
})
