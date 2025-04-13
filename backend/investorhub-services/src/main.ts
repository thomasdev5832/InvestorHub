import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Staking Aggregator API')
    .setDescription('API documentation for the Staking Aggregator service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document);

  // CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
