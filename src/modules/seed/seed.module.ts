// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity, Restaurant, Driver, Order } from 'src/models';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity,
    Restaurant,
    Driver,
    Order,])],
  providers: [SeedService],
})
export class SeedModule {}
