import { Module } from '@nestjs/common';
import { PoolService } from './pools/pool.service';
import { BlockHelper } from './helpers/block.helper';
import { SubgraphBlockHelper } from './helpers/subgraph-block.helper';

@Module({
  providers: [PoolService, BlockHelper, SubgraphBlockHelper],
  exports: [PoolService, BlockHelper, SubgraphBlockHelper],
})
export class SubgraphModule {} 