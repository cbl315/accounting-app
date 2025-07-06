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
    return (
      typeof this.amount === 'number' && 
      ['income', 'expense'].includes(this.type) &&
      typeof this.category === 'string' &&
      !isNaN(new Date(this.date).getTime())
    )
  }
}
