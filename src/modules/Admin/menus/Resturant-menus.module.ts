import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Product, Restaurant } from 'src/models';
import { MenuItemController } from './Resturant-menus.controller';
import { MenuItemService } from './Resturant-menus.service';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MenuItem, Restaurant, Category ])],
    controllers: [MenuItemController],
    providers: [MenuItemService],
})
export class MenuItemModule { }
