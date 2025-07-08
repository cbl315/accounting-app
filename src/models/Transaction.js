import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class Transaction extends Model {
  static table = 'transactions'

  @field('amount') amount
  @field('type') type
  @field('category') category
  @field('date') date
  @field('memo') memo
  @field('image_uri') imageUri

  get isValid() {
    // Convert amount to number if it's a string
    const amount = typeof this.amount === 'string' 
      ? parseFloat(this.amount)
      : this.amount

    // Normalize date format
    const normalizedDate = this.normalizeDate(this.date)

    return (
      !isNaN(amount) && 
      ['income', 'expense'].includes(this.type) &&
      typeof this.category === 'string' &&
      !isNaN(new Date(normalizedDate).getTime())
    )
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null
    
    // Handle various date formats
    if (dateStr.includes('/')) {
      const [year, month, day] = dateStr.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } else if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      const [day, month, year] = dateStr.split('-')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateStr
  }
}
