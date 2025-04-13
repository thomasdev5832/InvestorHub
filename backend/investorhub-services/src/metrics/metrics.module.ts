import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SubgraphMetricsService } from './subgraph-metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [SubgraphMetricsService],
  exports: [PrometheusModule, SubgraphMetricsService],
})
export class MetricsModule {} 