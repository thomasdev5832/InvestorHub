import { Module } from '@nestjs/common';
import { RunMigrationsCommand } from './run-migrations.command';
import { MigrationsModule } from '../database/migrations/migrations.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(mongoUri),
    MigrationsModule,
  ],
  providers: [RunMigrationsCommand],
})
export class CommandsModule {} 