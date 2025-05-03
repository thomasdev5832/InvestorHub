import { Module } from '@nestjs/common';
import { SubgraphModule } from './subgraph/subgraph.module';
import { MetricsModule } from './metrics/subgraph/metrics.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    SubgraphModule,
    MetricsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
