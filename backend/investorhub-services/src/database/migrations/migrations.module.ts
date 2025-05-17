import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationService } from './migration.service';
import { Migration, MigrationSchema } from '../schemas/migration.schema';
import { NetworkConfig, NetworkConfigSchema } from '../schemas/network-config.schema';
import { Token, TokenSchema } from '../schemas/token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Migration.name, schema: MigrationSchema },
      { name: NetworkConfig.name, schema: NetworkConfigSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationsModule {} 