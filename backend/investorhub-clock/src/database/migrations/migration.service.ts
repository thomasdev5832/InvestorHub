import { Injectable, Logger } from '@nestjs/common';
import { Migration } from '../schemas/migration.schema';
import { NetworkConfigRepository } from '../repositories/network-config.repository';
import { TokenRepository } from '../repositories/token.repository';
import { MigrationRepository } from '../repositories/migration.repository';
import * as initialNetworkTokens from '../migrations/001-initial-network-tokens';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrations = [
    initialNetworkTokens,
  ];

  constructor(
    private readonly migrationRepository: MigrationRepository,
    private readonly networkConfigRepository: NetworkConfigRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async runMigrations(): Promise<void> {
    this.logger.log('Starting migrations...');

    for (const migration of this.migrations) {
      try {
        await migration.up(
          this.networkConfigRepository,
          this.tokenRepository,
          this.migrationRepository,
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
          this.networkConfigRepository,
          this.tokenRepository,
          this.migrationRepository,
        );
      } catch (error) {
        this.logger.error(`Error reverting migration ${migration.name}: ${error.message}`);
        throw error;
      }
    }

    this.logger.log('All migrations reverted successfully');
  }
} 