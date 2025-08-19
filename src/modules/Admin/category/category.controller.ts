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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

  /* -------------------------- Create Category ------------------------ */

  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories', // folder to save images
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // If image uploaded, set the path in DTO
    if (image) {
      dto.image = `/uploads/categories/${image.filename}`;
    }

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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `category-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.image = `/uploads/categories/${file.filename}`;
    }

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
