import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './models/schema';
import Transaction from './models/Transaction';

// Create the adapter
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'accounting_app',
});

// Create the database
const database = new Database({
  adapter,
  modelClasses: [Transaction],
});

export { database };
