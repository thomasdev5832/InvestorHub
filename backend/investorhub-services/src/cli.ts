import { CommandFactory } from 'nest-commander';
import { CommandsModule } from './commands/commands.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const logger = new Logger('CLI');

  // Create a temporary app to load configuration
  const tempApp = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(),
  );
  const configService = tempApp.get(ConfigModule);
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  await tempApp.close();

  // Run the command
  await CommandFactory.run(CommandsModule, new Logger('CLI'));
}

bootstrap(); 