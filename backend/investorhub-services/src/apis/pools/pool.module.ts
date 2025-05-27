import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pool, PoolSchema } from '../../database/schemas/pool.schemas';
import { PoolDayData, PoolDayDataSchema } from '../../database/schemas/pool-day-data.schema';
import { PoolRepository } from './repositories/pool.repository';
import { PoolDayDataRepository } from './repositories/pool-day-data.repository';
import { PoolService } from './pool.service';
import { PoolController } from './pool.controller';
import { DatabaseModule } from '../../database/database.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pool.name, schema: PoolSchema },
      { name: PoolDayData.name, schema: PoolDayDataSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [PoolController],
  providers: [PoolRepository, PoolDayDataRepository, PoolService],
  exports: [PoolService],
})
export class PoolModule {} 