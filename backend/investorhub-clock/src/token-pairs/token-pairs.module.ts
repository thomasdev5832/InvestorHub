import { Module } from '@nestjs/common';
import { TokenPairsService } from './token-pairs.service';

import { DatabaseModule } from '../database/database.module';
import { NetworkConfig } from '../database/schemas/network-config.schema';
import { Token } from '../database/schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../database/schemas/token.schema';
import { NetworkConfigSchema } from '../database/schemas/network-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: NetworkConfig.name, schema: NetworkConfigSchema },
    ]),
    DatabaseModule,
  ],
  providers: [TokenPairsService],
  exports: [TokenPairsService],
})
export class TokenPairsModule {} 