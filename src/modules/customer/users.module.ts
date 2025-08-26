import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { UsersService } from './placed-order.service';

import { UsersController } from './users.controller';
import { MenuItem } from 'src/models/resturant-menu.entity';
import { Order, Restaurant, UserEntity } from 'src/models';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, UserEntity, Restaurant, MenuItem])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule { }
