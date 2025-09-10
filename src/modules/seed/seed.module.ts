// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity, Restaurant, Driver, Order, UserEntity } from 'src/models';
import { SeedService } from './seed.service';
import { UserSeedService } from './user.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      Restaurant,
      Driver,
      Order,
      UserEntity,
    ]),
  ],
  providers: [SeedService, UserSeedService],
})
export class SeedModule {}
