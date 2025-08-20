import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category,  Restaurant } from 'src/models';
import { MenuItemController } from './menu-items.controller';
import { MenuItemService } from './Resturant-menus.service';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MenuItem, Restaurant, Category ])],
    controllers: [MenuItemController],
    providers: [MenuItemService],
})
export class MenuItemModule { }
