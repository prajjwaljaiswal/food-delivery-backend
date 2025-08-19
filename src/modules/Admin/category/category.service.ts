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
    try {
      // 1. Check if restaurant exists
      const restaurant = await this.restaurantRepo.findOne({ where: { id: dto.restaurantId } });
      if (!restaurant) {
        return {
          status: false,
          code: 400,
          message: 'Restaurant does not exist',
          data: null,
        };
      }

      // 2. Check for duplicate category name in the same restaurant
      const exists = await this.categoryRepo.findOne({
        where: { name: dto.name, restaurantId: dto.restaurantId },
      });
      if (exists) {
        return {
          status: false,
          code: 400,
          message: 'Category already exists for this restaurant',
          data: null,
        };
      }

      // 3. Save category
      const category = this.categoryRepo.create(dto);
      const savedCategory = await this.categoryRepo.save(category);

      return {
        status: true,
        code: 201,
        message: 'Category created successfully',
        data: savedCategory,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                       Get list of all categories (DESC)                    */
  /* -------------------------------------------------------------------------- */
  async findAll() {
    try {
      const categories = await this.categoryRepo.find({ order: { id: 'DESC' } });

      if (!categories || categories.length === 0) {
        return {
          status: false,
          code: 404,
          message: 'No categories found',
          data: [],
        };
      }

      return {
        status: true,
        code: 200,
        message: 'Categories fetched successfully',
        data: categories,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                         Get a single category by ID                        */
  /* -------------------------------------------------------------------------- */
  async findOne(id: number) {
    try {
      const category = await this.categoryRepo.findOne({ where: { id } });

      if (!category) {
        return {
          status: false,
          code: 404,
          message: 'Category not found',
          data: null,
        };
      }

      return {
        status: true,
        code: 200,
        message: 'Category fetched successfully',
        data: category,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }


  /* -------------------------------------------------------------------------- */
  /*                   Update category data by its ID                           */
  /* -------------------------------------------------------------------------- */
  async update(id: number, dto: UpdateCategoryDto) {
    try {
      const response = await this.findOne(id);

      // If category not found, return the error response
      if (!response.status || !response.data) {
        return response;
      }

      const category = response.data;

      Object.assign(category, dto);
      const updatedCategory = await this.categoryRepo.save(category);

      return {
        status: true,
        code: 200,
        message: 'Category updated successfully',
        data: updatedCategory,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }


  /* -------------------------------------------------------------------------- */
  /*                         Delete a category by ID                            */
  /* -------------------------------------------------------------------------- */
  async remove(id: number) {
    try {
      const response = await this.findOne(id);

      if (!response.status || !response.data) {
        return response;
      }

      const category = response.data;

      await this.categoryRepo.remove(category);

      return {
        status: true,
        code: 200,
        message: 'Category removed successfully',
        data: null,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }


  /* -------------------------------------------------------------------------- */
  /*                  Toggle category active/inactive status                    */
  /* -------------------------------------------------------------------------- */
  async toggleStatus(id: number) {
    try {
      const response = await this.findOne(id);

      if (!response.status || !response.data) {
        return response;
      }

      const category = response.data;
      category.isActive = !category.isActive;

      const updatedCategory = await this.categoryRepo.save(category);

      return {
        status: true,
        code: 200,
        message: `Category has been ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedCategory,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: 'Internal server error',
        data: null,
      };
    }
  }

}
