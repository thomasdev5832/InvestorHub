import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './schemas/token.schema';
import { TokenRepository } from './repositories/token.repository';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [TokenRepository, TokenService],
  exports: [TokenService],
})
export class TokenModule {} 