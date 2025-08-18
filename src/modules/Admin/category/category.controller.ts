import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';


@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

  /* -------------------------- Create Category ------------------------ */
  @Post('create')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  /* -------------------------- Get All Categories ------------------------ */
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  /* -------------------------- Get Single Category ------------------------ */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /* -------------------------- Update Category ------------------------ */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  /* -------------------------- Delete Category ------------------------ */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /* -------------------------- Toggle Category Status ------------------------ */
  @Patch('toggle-status/:id')
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleStatus(id);
  }
}
