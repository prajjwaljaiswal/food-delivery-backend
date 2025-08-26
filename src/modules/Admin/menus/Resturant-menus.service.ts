import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';
import * as path from 'path';
import { Category, Restaurant } from 'src/models';
import { CreateMenuItemDto } from './dto/create-menus.dto';
import { UpdateMenuItemDto } from './dto/update-menus.dto';
import { AddOnEnum, DietaryTagEnum, MenuItem, VariantEnum } from 'src/models/resturant-menu.entity';

@Injectable()
export class MenuItemService {
    constructor(
        @InjectRepository(MenuItem)
        private readonly menuItemRepo: Repository<MenuItem>,
        @InjectRepository(Restaurant)
        private readonly restaurantRepo: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) { }

    // ✅ Create menu item with optional image
    async create(dto: CreateMenuItemDto, imageFile?: Express.Multer.File) {
        try {
            // 1️⃣ Find restaurant and category (unchanged)
            const restaurant = await this.restaurantRepo.findOneBy({ id: dto.restaurantId });
            if (!restaurant) return { status: false, code: 404, message: 'Restaurant not found', data: null };

            const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
            if (!category) return { status: false, code: 404, message: 'Category not found', data: null };

            // 2️⃣ Handle image upload (unchanged)
            let imagePath: string | undefined = undefined;
            if (imageFile) {
                const uploadDir = './uploads/menu-items/';
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                const filename = `${Date.now()}-${imageFile.originalname}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, imageFile.buffer);
                imagePath = filePath;
            }

            // 3️⃣ **Here:** Convert strings to enum arrays
            const variantsArray = dto.variants
                ? dto.variants
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => Object.values(VariantEnum).includes(v as VariantEnum)) as VariantEnum[]
                : undefined;

            const addOnsArray = dto.addOns
                ? dto.addOns
                    .split(',')
                    .map(a => a.trim())
                    .filter(a => Object.values(AddOnEnum).includes(a as AddOnEnum)) as AddOnEnum[]
                : undefined;

            const dietaryTagsArray = dto.dietaryTags
                ? dto.dietaryTags
                    .split(',')
                    .map(d => d.trim())
                    .filter(d => Object.values(DietaryTagEnum).includes(d as DietaryTagEnum)) as DietaryTagEnum[]
                : undefined;

            // 4️⃣ Pass arrays to create()
            const menuItem = this.menuItemRepo.create({
                ...dto,
                restaurant,
                category,
                image: imagePath,
                variants: variantsArray,
                addOns: addOnsArray,
                dietaryTags: dietaryTagsArray,
            });

            const savedMenuItem = await this.menuItemRepo.save(menuItem);

            return { status: true, code: 201, message: 'Menu item created successfully', data: savedMenuItem };
        } catch (error) {
            console.error(error);
            return { status: false, code: 500, message: 'Internal server error', data: null };
        }
    }



    // ✅ Get all menu items
    async findAll(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const [items, total] = await this.menuItemRepo
                .createQueryBuilder('menu')
                // join restaurant without selecting everything
                .leftJoin('menu.restaurant', 'restaurant')
                // join category fully (select all fields)
                .leftJoinAndSelect('menu.category', 'category')
                // now only pick safe restaurant fields (exclude password)
                .addSelect([
                    'restaurant.id',
                    'restaurant.name',
                    'restaurant.ownerName',
                    'restaurant.role',
                    'restaurant.address',
                    'restaurant.email',
                    'restaurant.phone',
                    'restaurant.secondaryPhone',
                    'restaurant.cuisine',
                    'restaurant.country',
                    'restaurant.state',
                    'restaurant.city',
                    'restaurant.pincode',
                    'restaurant.deliveryTime',
                    'restaurant.description',
                    'restaurant.enableOnlineOrders',
                    'restaurant.enableTableBooking',
                    'restaurant.logo',
                    'restaurant.galleryImages',
                    'restaurant.bannerImages',
                    'restaurant.is_verified',
                    'restaurant.opening_time',
                    'restaurant.closing_time',
                    'restaurant.is_active',
                    'restaurant.created_at',
                    'restaurant.updated_at',
                    'restaurant.weeklySchedule',
                ])
                .orderBy('menu.id', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            return {
                status: true,
                code: 200,
                message: 'Menu items fetched successfully',
                data: items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error(error);
            return {
                status: false,
                code: 500,
                message: 'Internal server error',
                data: null,
            };
        }
    }


    // ✅ Get one menu item

    async findOne(id: number) {
        try {
            const item = await this.menuItemRepo
                .createQueryBuilder('menu')
                .leftJoinAndSelect('menu.restaurant', 'restaurant')
                .leftJoinAndSelect('menu.category', 'category')
                .addSelect([
                    'restaurant.id',
                    'restaurant.name',
                    'restaurant.ownerName',
                    'restaurant.role',
                    'restaurant.address',
                    'restaurant.email',
                    'restaurant.phone',
                    'restaurant.secondaryPhone',
                    // 'restaurant.password',
                    'restaurant.cuisine',
                    'restaurant.country',
                    'restaurant.state',
                    'restaurant.city',
                    'restaurant.pincode',
                    'restaurant.deliveryTime',
                    'restaurant.description',
                    'restaurant.enableOnlineOrders',
                    'restaurant.enableTableBooking',
                    'restaurant.logo',
                    'restaurant.galleryImages',
                    'restaurant.bannerImages',
                    'restaurant.is_verified',
                    'restaurant.opening_time',
                    'restaurant.closing_time',
                    'restaurant.is_active',
                    'restaurant.created_at',
                    'restaurant.updated_at',
                    'restaurant.weeklySchedule',
                ])
                .where('menu.id = :id', { id })
                .getOne();

            if (!item)
                return { status: false, code: 404, message: 'Menu item not found', data: null };

            return { status: true, code: 200, message: 'Menu item fetched successfully', data: item };
        } catch (error) {
            console.error(error);
            return { status: false, code: 500, message: 'Internal server error', data: null };
        }
    }

    // ✅ Update menu item with optional image
    // ✅ Update menu item with optional image
    // async update(id: number, dto: UpdateMenuItemDto, imageFile?: Express.Multer.File) {
    //     try {
    //         // Convert comma-separated strings to arrays if provided
    //         const variantsArray = dto.variants
    //             ? dto.variants.split(',').map(v => VariantEnum[v.trim() as keyof typeof VariantEnum])
    //             : undefined;

    //         const addOnsArray = dto.addOns
    //             ? dto.addOns.split(',').map(a => AddOnEnum[a.trim() as keyof typeof AddOnEnum])
    //             : undefined;

    //         const dietaryTagsArray = dto.dietaryTags
    //             ? dto.dietaryTags.split(',').map(d => DietaryTagEnum[d.trim() as keyof typeof DietaryTagEnum])
    //             : undefined;

    //         // Preload existing menu item with new data
    //         const menuItem = await this.menuItemRepo.preload({
    //             id,
    //             ...dto,
    //             variants: variantsArray,
    //             addOns: addOnsArray,
    //             dietaryTags: dietaryTagsArray,
    //         });

    //         if (!menuItem)
    //             return { status: false, code: 404, message: 'Menu item not found', data: null };

    //         // Handle optional image upload
    //         if (imageFile) {
    //             const uploadDir = './uploads/menu-items/';
    //             if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    //             const filename = `${Date.now()}-${imageFile.originalname}`;
    //             const filePath = path.join(uploadDir, filename);
    //             fs.writeFileSync(filePath, imageFile.buffer);
    //             menuItem.image = filePath;
    //         }

    //         const updated = await this.menuItemRepo.save(menuItem);
    //         return { status: true, code: 200, message: 'Menu item updated successfully', data: updated };
    //     } catch (error) {
    //         console.error(error);
    //         return { status: false, code: 500, message: 'Internal server error', data: null };
    //     }
    // }

async update(id: number, dto: UpdateMenuItemDto, imageFile?: Express.Multer.File) {
  try {
    const variantsArray = dto.variants
      ? dto.variants.split(',').map(v => v.trim()).filter(v => Object.values(VariantEnum).includes(v as VariantEnum)) as VariantEnum[]
      : undefined;

    const addOnsArray = dto.addOns
      ? dto.addOns.split(',').map(a => a.trim()).filter(a => Object.values(AddOnEnum).includes(a as AddOnEnum)) as AddOnEnum[]
      : undefined;

    const dietaryTagsArray = dto.dietaryTags
      ? dto.dietaryTags.split(',').map(d => d.trim()).filter(d => Object.values(DietaryTagEnum).includes(d as DietaryTagEnum)) as DietaryTagEnum[]
      : undefined;

    const menuItem = await this.menuItemRepo.preload({
      id,
      ...dto,
      variants: variantsArray,
      addOns: addOnsArray,
      dietaryTags: dietaryTagsArray,
    });

    if (!menuItem) {
      return { status: false, code: 404, message: 'Menu item not found', data: null };
    }

    if (imageFile) {
      const uploadDir = './uploads/menu-items/';
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${imageFile.originalname}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, imageFile.buffer);
      menuItem.image = filePath;
    }

    const updated = await this.menuItemRepo.save(menuItem);
    return { status: true, code: 200, message: 'Menu item updated successfully', data: updated };
  } catch (error) {
    console.error(error);
    return { status: false, code: 500, message: 'Internal server error', data: null };
  }
}

    // ✅ Remove menu item
    async remove(id: number) {
        try {
            const item = await this.menuItemRepo.findOne({ where: { id } });
            if (!item) return { status: false, code: 404, message: 'Menu item not found', data: null };

            await this.menuItemRepo.remove(item);
            return { status: true, code: 200, message: 'Menu item removed successfully', data: null };
        } catch (error) {
            return { status: false, code: 500, message: 'Internal server error', data: null };
        }
    }
}
