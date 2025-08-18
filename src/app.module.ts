import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seed/seed.module';
import { AdminModule } from './modules/Admin/admin.module';
import { ResturenMainModule } from './modules/Restaurant/resturent.module';
import { EmailModule } from './common/email/email.module';
import { DriverMainModule } from './modules/Driver/Driver.module';
import { AdminDashboardModule } from './modules/Admin/Dashboard/dashboad.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    SeedModule,
    AdminModule,
    ResturenMainModule,
    EmailModule,
    DriverMainModule,
    AdminDashboardModule,
  ],
})
export class AppModule { }
