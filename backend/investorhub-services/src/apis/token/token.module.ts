import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token, TokenSchema } from '../../database/schemas/token.schema';
import { NetworkConfig, NetworkConfigSchema } from '../../database/schemas/network-config.schema';
import { DatabaseModule } from '../../database/database.module';
import { TokenRepository } from './token.repository';
import { NetworkConfigRepository } from '../network-config/network-config.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: NetworkConfig.name, schema: NetworkConfigSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [TokenController],
  providers: [TokenService, TokenRepository, NetworkConfigRepository],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
