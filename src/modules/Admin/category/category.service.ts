import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Restaurant } from 'src/models';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,


    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
  ) { }

  /* -------------------------------------------------------------------------- */
  /*                             Create new category                            */
  /* -------------------------------------------------------------------------- */
  async create(dto: CreateCategoryDto) {
    // 1. Check if restaurant exists
    const restaurant = await this.restaurantRepo.findOne({ where: { id: dto.restaurantId } });
    if (!restaurant) {
      throw new BadRequestException('Restaurant does not exist');
    }

    // 2. Check for duplicate category name in the same restaurant
    const exists = await this.categoryRepo.findOne({
      where: { name: dto.name, restaurantId: dto.restaurantId },
    });
    if (exists) {
      throw new BadRequestException('Category already exists for this restaurant');
    }

    // 3. Save category
    const category = this.categoryRepo.create(dto);
    return await this.categoryRepo.save(category);
  }
  /* -------------------------------------------------------------------------- */
  /*                       Get list of all categories (DESC)                    */
  /* -------------------------------------------------------------------------- */
  findAll() {
    return this.categoryRepo.find({ order: { id: 'DESC' } });
  }

  /* -------------------------------------------------------------------------- */
  /*                         Get a single category by ID                        */
  /* -------------------------------------------------------------------------- */
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /* -------------------------------------------------------------------------- */
  /*                   Update category data by its ID                           */
  /* -------------------------------------------------------------------------- */
  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.categoryRepo.save(category);
  }

  /* -------------------------------------------------------------------------- */
  /*                         Delete a category by ID                            */
  /* -------------------------------------------------------------------------- */
  async remove(id: number) {
    const category = await this.findOne(id);
    return await this.categoryRepo.remove(category);
  }

  /* -------------------------------------------------------------------------- */
  /*                  Toggle category active/inactive status                    */
  /* -------------------------------------------------------------------------- */
  async toggleStatus(id: number) {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return await this.categoryRepo.save(category);
  }
}
