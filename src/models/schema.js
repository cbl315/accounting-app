import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'amount', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'type', type: 'string' } // 'income' or 'expense'
      ]
    })
  ]
});
