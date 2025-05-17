import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolSchema } from './schemas/pool.schemas';
import { PoolDayData, PoolDayDataSchema } from './schemas/pool-day-data.schema';
import { PoolRepository } from './repositories/pool.repository';
import { PoolDayDataRepository } from './repositories/pool-day-data.repository';
import { TokenRepository } from './repositories/token.repository';
import { NetworkConfigRepository } from './repositories/network-config.repository';
import { Token } from './schemas/token.schema';
import { NetworkConfigSchema } from './schemas/network-config.schema';
import { TokenSchema } from './schemas/token.schema';
import { NetworkConfig } from './schemas/network-config.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DATABASE'),
        maxPoolSize: 10,
        minPoolSize: 5,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Pool.name, schema: PoolSchema },
      { name: PoolDayData.name, schema: PoolDayDataSchema },
      { name: Token.name, schema: TokenSchema },
      { name: NetworkConfig.name, schema: NetworkConfigSchema },
    ]),
  ],
  providers: [
    PoolRepository,
    PoolDayDataRepository,
    TokenRepository,
    NetworkConfigRepository,
  ],
  exports: [
    PoolRepository,
    PoolDayDataRepository,
    TokenRepository,
    NetworkConfigRepository,
  ],
})
export class DatabaseModule {} 