import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationService } from './migration.service';

@Module({
  imports: [MongooseModule],
  providers: [MigrationService],
})
export class MigrationsModule {
  constructor(
    private readonly migrationService: MigrationService,
  ) {
    // Register migrations
  }
} 