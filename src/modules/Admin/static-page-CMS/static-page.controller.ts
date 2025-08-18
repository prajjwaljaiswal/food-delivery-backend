
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PageService } from './static-page.service';
import { CreatePageDto } from './dto/create-static-page.dto';
import { UpdatePageDto } from './dto/update-static-page.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';

// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles(RoleEnum.ADMIN)
@Controller('admin/pages')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
