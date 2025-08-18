import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category, Product } from 'src/models';
import { Restaurant } from 'src/models';
// import { Restaurant } from '../restaurant/restaurant.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
    ) { }

    async create(dto: CreateProductDto) {
        const category = await this.categoryRepo.findOne({ where: { id: dto.category_id } });
        const restaurant = await this.restaurantRepo.findOne({ where: { id: dto.restaurant_id } });

        if (!category) throw new NotFoundException('Category not found');
        if (!restaurant) throw new NotFoundException('Restaurant not found');

        const product = this.productRepo.create({
            ...dto,
            category,
            restaurant,
        });

        return this.productRepo.save(product);
    }

    findAll() {
        console.log('Fetching all products');
        return this.productRepo.find({
            relations: ['category'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category'],
        });

        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: number, dto: UpdateProductDto) {
        const product = await this.findOne(id);
        console.log('Updating product with ID:', id);
        console.log('Update data:', dto);
        if (dto.category_id) {
            const category = await this.categoryRepo.findOne({ where: { id: dto.category_id } });
            if (!category) throw new NotFoundException('Category not found');
            product.category = category;
        }

        // if (dto.restaurant_id) {
        // //   const restaurant = await this.restaurantRepo.findOne({ where: { id: dto.restaurant_id } });
        //   if (!restaurant) throw new NotFoundException('Restaurant not found');
        //   product.restaurant = restaurant;
        // }

        Object.assign(product, dto);
        return this.productRepo.save(product);
    }

    async remove(id: number) {
        const product = await this.findOne(id);
        return this.productRepo.remove(product);
    }



}
