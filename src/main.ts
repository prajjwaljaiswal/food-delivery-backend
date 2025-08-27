import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  // ✅ Disable default body parser so Multer can handle multipart/form-data
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // ✅ Global ValidationPipe
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

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription('Food Delivery API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ✅ Static folder for uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // ✅ Enable CORS
  // app.enableCors({
  //   origin: '*',
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  //   credentials: true,
  // });

  app.enableCors({
    origin: '*', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,               // allows cookies/auth headers
  });


  // ✅ Additional ValidationPipe (optional)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Seeder
  const seeder = app.get(SeedService);

  console.log('🔹 Seeding roles...');
  await seeder.seedRoles();

  console.log('🔹 Seeding categories...');
  await seeder.seedCategories();

  // ✅ Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
