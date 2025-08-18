import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'src/models';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) { }

  /* -------------------------------------------------------------------------- */
  /*                             Create new category                            */
  /* -------------------------------------------------------------------------- */
  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new Error('Category already exists');
    return await this.categoryRepo.save(dto);
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
