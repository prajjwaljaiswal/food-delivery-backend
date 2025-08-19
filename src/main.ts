import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(err => Object.values(err.constraints || {})).flat();
      return new BadRequestException({
        status: false,
        code: 400,
        message: messages,
        data: null
      });
    }
  }));


  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription('Food Delivery API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads')),
  );

  // ✅ Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const seeder = app.get(SeedService);
  await seeder.seedRoles();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
