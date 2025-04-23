import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationService } from './migration.service';
import { TokenMigration } from './token.migration';

@Module({
  imports: [MongooseModule],
  providers: [MigrationService, TokenMigration],
})
export class MigrationsModule {
  constructor(
    private readonly migrationService: MigrationService,
    private readonly tokenMigration: TokenMigration,
  ) {
    // Register migrations
    this.migrationService.registerMigration(this.tokenMigration);
  }
} 