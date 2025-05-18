import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationsModule {} 