import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InitializePoolsService } from './initialize-pools.service';
import { TokenPairsModule } from '../token-pairs/token-pairs.module';
import { PoolStorageModule } from '../pools-storage/pool-storage.module';
import { PoolModule } from '../subgraph/pools/pool.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TokenPairsModule,
    PoolStorageModule,
    PoolModule,
  ],
  providers: [InitializePoolsService],
  exports: [InitializePoolsService],
})
export class CronModule {} 