import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards, Query } from '@nestjs/common';
import { MenuItemService } from './Resturant-menus.service';
import { CreateMenuItemDto } from './dto/create-menus.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { UpdateMenuItemDto } from './dto/update-menus.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/menu-items')
export class MenuItemController {
    constructor(private readonly menuItemService: MenuItemService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(@Body() dto: CreateMenuItemDto, @UploadedFile() imageFile?: Express.Multer.File) {
        return this.menuItemService.create(dto, imageFile);
    }


    @Get()
    findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        return this.menuItemService.findAll(page, limit);
    }


    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.menuItemService.findOne(id);
    }


    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    update(@Param('id') id: number, @Body() dto: UpdateMenuItemDto, @UploadedFile() imageFile?: Express.Multer.File) {
        return this.menuItemService.update(id, dto, imageFile);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.menuItemService.remove(id);
    }
}
