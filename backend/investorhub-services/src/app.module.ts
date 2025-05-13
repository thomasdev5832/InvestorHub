import { Module } from '@nestjs/common';
import { SubgraphModule } from './subgraph/subgraph.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { MongoDBModule } from './mongodb/mongodb.module';
import { MetricsModule } from './metrics/subgraph/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SubgraphModule,
    HealthModule,
    MongoDBModule,
    MetricsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
