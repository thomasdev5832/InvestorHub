import { Module } from '@nestjs/common';
import { SubgraphModule } from './apis/subgraph/subgraph.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { MetricsModule } from './metrics/subgraph/metrics.module';
import { ApisModule } from './apis/apis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ApisModule,
    HealthModule,
    DatabaseModule,
    MetricsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
