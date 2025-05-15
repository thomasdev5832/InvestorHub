import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Migration } from './migration.interface';

@Injectable()
export class MigrationService implements OnModuleInit {
  private migrations: Migration[] = [];

  constructor(@InjectConnection() private readonly connection: Connection) {}

  registerMigration(migration: Migration) {
    this.migrations.push(migration);
  }

  async onModuleInit() {
    await this.runMigrations();
  }

  private async runMigrations() {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    const db = this.connection.db;
    const migrationsCollection = db.collection('migrations');

    // Sort migrations by version
    this.migrations.sort((a, b) => a.version - b.version);

    for (const migration of this.migrations) {
      const existingMigration = await migrationsCollection.findOne({
        version: migration.version,
      });

      if (!existingMigration) {
        console.log(`Running migration: ${migration.description}`);
        try {
          await migration.up();
          await migrationsCollection.insertOne({
            version: migration.version,
            description: migration.description,
            executedAt: new Date(),
          });
          console.log(`Migration ${migration.version} completed successfully`);
        } catch (error) {
          console.error(`Migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    }
  }
} 