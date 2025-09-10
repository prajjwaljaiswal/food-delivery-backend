import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { UserSeedService } from './modules/seed/user.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // ✅ CORS sabse pehle enable karo
  // process.env.FRONTEND_URL ||

  // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  // app.enableCors({
  //   origin: frontendUrl,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  //   credentials: true, // '*' ke saath true nahi chalega
  // });
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://food-ordering.projectstatus.co.uk',
    process.env.FRONTEND_URL, // optional: in case you set a custom URL in env
  ].filter(Boolean); // removes undefined if FRONTEND_URL is not set

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // must be true if sending cookies
  });

  // ✅ Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors
          .map((err) => Object.values(err.constraints || {}))
          .flat();
        return new BadRequestException({
          status: false,
          code: 400,
          message: messages,
          data: null,
        });
      },
    }),
  );

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

  // ✅ Seeder
  const seeder = app.get(SeedService);
  console.log('🔹 Seeding roles...');
  await seeder.seedRoles();

  const userSeeder = app.get(UserSeedService);
  console.log('🔹 Seeding users...');
  await userSeeder.seedUsers();

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
