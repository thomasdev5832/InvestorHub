import { Migration } from './migration.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenMigration implements Migration {
  version = 1;
  description = 'Create tokens collection with indexes';

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async up(): Promise<void> {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    const db = this.connection.db;
    const tokensCollection = db.collection('tokens');

    // Create indexes
    await tokensCollection.createIndex({ address: 1 }, { unique: true });
    await tokensCollection.createIndex({ symbol: 1 });
    await tokensCollection.createIndex({ name: 1 });
  }

  async down(): Promise<void> {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    const db = this.connection.db;
    const tokensCollection = db.collection('tokens');

    // Drop indexes
    await tokensCollection.dropIndex('address_1');
    await tokensCollection.dropIndex('symbol_1');
    await tokensCollection.dropIndex('name_1');
  }
} 