import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';


// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles(RoleEnum.ADMIN)
@Controller('admin/products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    /* -------------------------- Create Product -------------------------- */
    @Post()
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    /* -------------------------- Get All Products ------------------------ */
    @Get()
    findAll() {
        return this.productService.findAll();
    }

    /* -------------------------- Get Single Product ---------------------- */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productService.findOne(id);
    }

    /* -------------------------- Update Product -------------------------- */
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
        return this.productService.update(id, dto);
    }

    /* -------------------------- Delete Product -------------------------- */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productService.remove(id);
    }

}
