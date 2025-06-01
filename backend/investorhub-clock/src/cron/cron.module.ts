import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InitializePoolsService } from './initialize-pools.service';
import { UpdatePoolsDaysService } from './update-pools-days.service';
import { UpdatePoolsHoursService } from './update-pools-hours.service';
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
  providers: [
    InitializePoolsService,
    UpdatePoolsDaysService,
    UpdatePoolsHoursService,
  ],
  exports: [
    InitializePoolsService,
    UpdatePoolsDaysService,
    UpdatePoolsHoursService,
  ],
})
export class CronModule {} 