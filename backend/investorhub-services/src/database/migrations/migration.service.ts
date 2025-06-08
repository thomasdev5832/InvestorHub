import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Migration } from '../schemas/migration.schema';
import { NetworkConfig } from '../schemas/network-config.schema';
import { Token } from '../schemas/token.schema';
import * as createCollections from '../migrations/000-create-collections';
import * as initialNetworkTokens from '../migrations/001-initial-network-tokens';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrations = [
    createCollections,
    initialNetworkTokens,
  ];

  constructor(
    @InjectModel(Migration.name) private readonly migrationModel: Model<Migration>,
    @InjectModel(NetworkConfig.name) private readonly networkConfigModel: Model<NetworkConfig>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
  ) {}

  async runMigrations(): Promise<void> {
    this.logger.log('Starting migrations...');

    for (const migration of this.migrations) {
      try {
        await migration.up(
          this.networkConfigModel,
          this.tokenModel,
          this.migrationModel,
        );
      } catch (error) {
        this.logger.error(`Error running migration ${migration.name}: ${error.message}`);
        throw error;
      }
    }

    this.logger.log('All migrations completed successfully');
  }

  async revertMigrations(): Promise<void> {
    this.logger.log('Reverting migrations...');

    // Run migrations in reverse order
    for (const migration of this.migrations.reverse()) {
      try {
        await migration.down(
          this.networkConfigModel,
          this.tokenModel,
          this.migrationModel,
        );
      } catch (error) {
        this.logger.error(`Error reverting migration ${migration.name}: ${error.message}`);
        throw error;
      }
    }

    this.logger.log('All migrations reverted successfully');
  }
} 