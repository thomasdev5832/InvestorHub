import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PoolStorageService } from './pool-storage.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [PoolStorageService],
  exports: [PoolStorageService],
})
export class PoolStorageModule {} 