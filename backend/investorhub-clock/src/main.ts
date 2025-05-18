import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationService } from './database/migrations/migration.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  try {
    // Run migrations
      const migrationService = app.get(MigrationService);
      await migrationService.runMigrations();
      logger.log('Migrations completed successfully');
    } catch (error) {
      logger.error('Error running migrations:', error);
      process.exit(1);
  }

  await app.listen(process.env.PORT ?? 3000);
  
}

bootstrap();
