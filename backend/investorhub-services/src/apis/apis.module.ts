import { Module } from '@nestjs/common';
import { PoolModule } from './pools/pool.module';
import { SubgraphModule } from './subgraph/subgraph.module';
import { TokenModule } from './token/token.module';
import { UniswapCalculatorModule } from './uniswap-calculator/uniswap-calculator.module';

@Module({
  imports: [
    PoolModule,
    TokenModule,
    SubgraphModule,
    UniswapCalculatorModule,
  ],
  exports: [
    PoolModule,
    TokenModule,
    SubgraphModule,
    UniswapCalculatorModule,
  ]
})
export class ApisModule {}
