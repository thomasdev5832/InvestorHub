import { Module } from '@nestjs/common';
import { SubgraphModule } from './subgraph/subgraph.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    SubgraphModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
