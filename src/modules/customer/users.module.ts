import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { UsersService } from './placed-order.service';

import { UsersController } from './users.controller';
import { MenuItem } from 'src/models/resturant-menu.entity';
import { Order, Restaurant, UserEntity } from 'src/models';
import { UsersService } from './users.service';
import { AddressEntity } from 'src/models/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, UserEntity, Restaurant, MenuItem ,AddressEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule { }
