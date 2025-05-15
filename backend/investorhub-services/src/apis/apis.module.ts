import { Module } from '@nestjs/common';
import { PoolModule } from './pools/pool.module';
import { SubgraphModule } from './subgraph/subgraph.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    PoolModule,
    TokenModule,
    SubgraphModule,
  ],
  exports: [
    PoolModule,
    TokenModule,
    SubgraphModule,
  ]
})
export class ApisModule {}
