import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token, TokenSchema } from '../../database/schemas/token.schema';
import { DatabaseModule } from '../../database/database.module';
import { TokenRepository } from './token.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    DatabaseModule,
  ],
  controllers: [TokenController],
  providers: [TokenService, TokenRepository],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
