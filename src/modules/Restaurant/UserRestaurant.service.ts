import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {  InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { Restaurant } from 'src/models';
import { LoginDto } from './dto/Resturent-login.dto';
import { DeviceToken } from 'src/models';
import { EmailService } from 'src/common/email/email.service';
import { Otp } from 'src/models';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';
import { RoleEntity } from 'src/models';
import { MenuItem } from 'src/models/resturant-menu.entity';
import { Category } from 'src/models/category.entity';
import { CreateMenuDto } from './dto/create-menu.dto';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private restaurantRepo: Repository<Restaurant>,

        @InjectRepository(MenuItem)
        private readonly menuRepository: Repository<MenuItem>,

        @InjectRepository(DeviceToken)
        private readonly deviceTokenRepo: Repository<DeviceToken>,

        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,

        @InjectRepository(Otp)
        private readonly otpRepo: Repository<Otp>,

        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        private readonly jwtService: JwtService,

        private readonly emailService: EmailService,

    ) { }

    // Helper methods for OTP generation
    private generateOtpCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private getOtpExpiry(): Date {
        return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    async findAll(page: number = 1, limit: number = 10, filters?: any) {
        const skip = (page - 1) * limit;

        const query = this.restaurantRepo
            .createQueryBuilder("restaurant")
            .select([
                "restaurant.id",
                "restaurant.name",
                "restaurant.ownerName",
                "restaurant.address",
                "restaurant.email",
                "restaurant.phone",
                "restaurant.secondaryPhone",
                "restaurant.cuisine",
                "restaurant.country",
                "restaurant.state",
                "restaurant.city",
                "restaurant.pincode",
                "restaurant.deliveryTime",
                "restaurant.description",
                "restaurant.enableOnlineOrders",
                "restaurant.enableTableBooking",
                "restaurant.logo",
                "restaurant.weeklySchedule",
                "restaurant.galleryImages",
                "restaurant.foodSafetyCertificate",
                "restaurant.bannerImages",
                "restaurant.opening_time",
                "restaurant.closing_time",
                "restaurant.is_active",
                "restaurant.businessLicense",
                "restaurant.insuranceCertificate",
                "restaurant.is_verified",
                "restaurant.created_at",
                "restaurant.updated_at",
            ])
            .skip(skip)
            .take(limit)
            .orderBy("restaurant.created_at", "DESC");

        // Filter logic
        if (filters?.keyword) {
            query.where(
                "restaurant.name LIKE :keyword OR restaurant.email LIKE :keyword OR restaurant.phone LIKE :keyword",
                { keyword: `%${filters.keyword}%` }
            );
        }

        // Agar manually role chahiye to join karo
        if (filters?.includeRole) {
            query.leftJoinAndSelect("restaurant.role", "role");
        }

        const [restaurants, total] = await query.getManyAndCount();

        return {
            status: 200,
            success: true,
            message: "Restaurants fetched successfully.",
            data: restaurants,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getMenusByRestaurantId(restaurantId: string) {
        const menus = await this.menuRepository.find({
            where: { restaurant: { id: Number(restaurantId) } }, // restaurantId ko number me convert karo
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                image: true,
                inStock: true,
                variants: true,
                addOns: true,
                dietaryTags: true
            },
        });
        if (!menus || menus.length === 0) {
            throw new NotFoundException(`No menus found for restaurant ID: ${restaurantId}`);
        }

        return {
            success: true,
            message: 'Menus fetched successfully',
            data: menus,
        };
    }

    /* -------------------------- Restaurant Registration ------------------------ */
    async register(dto: RestaurantRegisterDto) {
        try {
            // Check if restaurant already exists
            const existingRestaurant = await this.restaurantRepo.findOne({
                where: [
                    { email: dto.email },
                    { phone: dto.phone }
                ]
            });

            if (existingRestaurant) {
                // If restaurant exists but is not verified, resend OTP
                if (!existingRestaurant.is_verified) {
                    const otpCode = this.generateOtpCode();
                    await this.otpRepo.save({
                        email: existingRestaurant.email,
                        otpCode,
                        otpType: 'restaurant_verify',
                        expiresAt: this.getOtpExpiry(),
                        user: existingRestaurant,
                    });

                    // Send OTP email
                    try {
                        await this.emailService.sendTemplateNotification({
                            user: {
                                email: existingRestaurant.email,
                                name: existingRestaurant.name
                            },
                            template: 'restaurant-welcome',
                            data: { otp: otpCode },
                        });
                    } catch (emailErr) {
                        console.error('Failed to send verification email', emailErr);
                    }

                    return {
                        status: 200,
                        success: true,
                        message: 'OTP resent to your email.',
                        data: { email: existingRestaurant.email }
                    };
                }

                return {
                    status: 409,
                    success: false,
                    message: 'Restaurant with this email or phone already exists.',
                    data: null
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(dto.password, 10);

            // Get restaurant role (assuming role ID 2 is for restaurants)
            const role = await this.roleRepo.findOne({ where: { id: 2 } });
            if (!role) {
                return {
                    status: 400,
                    success: false,
                    message: 'Restaurant role not found.',
                    data: null
                };
            }

            // Create restaurant entity (unverified initially)
            const restaurant = this.restaurantRepo.create({
                ...dto,
                password: hashedPassword,
                role: role,
                is_active: true,
                is_verified: false, // Will be verified after OTP verification
            });

            // Save restaurant
            const savedRestaurant = await this.restaurantRepo.save(restaurant);

            // Generate OTP
            const otpCode = this.generateOtpCode();
            await this.otpRepo.save({
                email: savedRestaurant.email,
                channel: 'email',
                otpCode,
                otpType: 'restaurant_verify',
                expiresAt: this.getOtpExpiry(),
                user: savedRestaurant,
            });

            // Send OTP email
            try {
                await this.emailService.sendTemplateNotification({
                    user: {
                        email: savedRestaurant.email,
                        name: savedRestaurant.name
                    },
                    template: 'restaurant-welcome',
                    data: { otp: otpCode },
                });
            } catch (emailErr) {
                console.error('Failed to send verification email', emailErr);
            }

            return {
                status: 201,
                success: true,
                message: 'OTP sent to your email for verification.',
                data: { id: savedRestaurant.id, email: savedRestaurant.email }
            };

        } catch (error) {
            console.error('Restaurant registration error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error during registration.',
                data: null
            };
        }
    }

    /* -------------------------- Restaurant Login ------------------------ */
    async login(dto: LoginDto, req: Request) {
        try {
            // Find restaurant by email or phone
            const restaurant = await this.restaurantRepo.findOne({
                where: [
                    { email: dto.username },
                    { phone: dto.username }
                ],
                relations: ['role']
            });

            if (!restaurant) {
                return {
                    status: 401,
                    success: false,
                    message: 'Invalid credentials.',
                    data: null
                };
            }

            // Check if restaurant is active
            if (!restaurant.is_active) {
                return {
                    status: 401,
                    success: false,
                    message: 'Restaurant account is deactivated.',
                    data: null
                };
            }

            // Check if restaurant is verified
            if (!restaurant.is_verified) {
                // Send OTP for verification
                const otpCode = this.generateOtpCode();
                await this.otpRepo.save({
                    email: restaurant.email,
                    channel: 'email',
                    otpCode,
                    otpType: 'restaurant_verify',
                    expiresAt: this.getOtpExpiry(),
                    user: restaurant,
                });

                // Send OTP email
                try {
                    await this.emailService.sendTemplateNotification({
                        user: {
                            email: restaurant.email,
                            name: restaurant.name
                        },
                        template: 'restaurant-welcome',
                        data: { otp: otpCode },
                    });
                } catch (emailErr) {
                    console.error('Failed to send verification email', emailErr);
                }

                return {
                    status: 200,
                    success: true,
                    message: 'Please verify your email address. OTP sent to your email.',
                    data: {
                        email: restaurant.email,
                        requires_verification: true,
                        message: 'Check your email for OTP to complete login'
                    }
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(dto.password, restaurant.password);
            if (!isPasswordValid) {
                return {
                    status: 401,
                    success: false,
                    message: 'Invalid credentials.',
                    data: null
                };
            }

            // Generate JWT token
            const payload = {
                sub: restaurant.id,
                email: restaurant.email,
                role_id: restaurant.role?.id || restaurant.role?.slug,
                type: 'restaurant'
            };

            const token = this.jwtService.sign(payload);

            // Save device token if provided
            if (dto.device_token) {
                const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
                
                // Check if device token already exists
                const existingDeviceToken = await this.deviceTokenRepo.findOne({
                    where: { 
                        deviceToken: dto.device_token,
                        restaurant_id: restaurant.id
                    }
                });

                if (!existingDeviceToken) {
                    const deviceToken = this.deviceTokenRepo.create({
                        deviceToken: dto.device_token,
                        restaurant_id: restaurant.id,
                        ipAddress: clientIp,
                        jwtToken: token,
                        role: 'restaurant'
                    });
                    await this.deviceTokenRepo.save(deviceToken);
                }
            }

            // Remove password from response
            const { password, ...restaurantWithoutPassword } = restaurant;

            return {
                status: 200,
                success: true,
                message: 'Login successful.',
                data: {
                    token,
                    user: restaurantWithoutPassword
                }
            };

        } catch (error) {
            console.error('Restaurant login error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error during login.',
                data: null
            };
        }
    }

    /* -------------------------- Restaurant OTP Verification ------------------------ */
    async verifyOtp(dto: VerifyOtpDto, req: Request) {
        try {
            // Find restaurant by email
            const restaurant = await this.restaurantRepo.findOne({
                where: { email: dto.email },
                relations: ['role']
            });

            if (!restaurant) {
                return {
                    status: 404,
                    success: false,
                    message: 'Restaurant not found.',
                    data: null
                };
            }

            // Find OTP
            const otp = await this.otpRepo.findOne({
                where: {
                    otpCode: dto.otp_code,
                    email: dto.email,
                    otpType: 'restaurant_verify',
                },
                order: { id: 'DESC' },
            });

            if (!otp) {
                return {
                    status: 400,
                    success: false,
                    message: 'Invalid OTP.',
                    data: null
                };
            }

            if (otp.expiresAt < new Date()) {
                return {
                    status: 400,
                    success: false,
                    message: 'OTP expired.',
                    data: null
                };
            }

            if (otp.isUsed) {
                return {
                    status: 400,
                    success: false,
                    message: 'OTP already used.',
                    data: null
                };
            }

            // Mark OTP as used
            otp.isUsed = true;
            await this.otpRepo.save(otp);

            // Verify restaurant
            restaurant.is_verified = true;
            await this.restaurantRepo.save(restaurant);

            // Generate JWT token
            const payload = {
                sub: restaurant.id,
                email: restaurant.email,
                role: restaurant.role?.name || 'restaurant',
                type: 'restaurant'
            };

            const token = this.jwtService.sign(payload);

            // Save device token if provided
            if (dto.device_token) {
                const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
                
                const existingDeviceToken = await this.deviceTokenRepo.findOne({
                    where: { 
                        deviceToken: dto.device_token,
                        restaurant_id: restaurant.id
                    }
                });

                if (!existingDeviceToken) {
                    const deviceToken = this.deviceTokenRepo.create({
                        deviceToken: dto.device_token,
                        restaurant_id: restaurant.id,
                        ipAddress: clientIp,
                        jwtToken: token,
                        role: 'restaurant'
                    });
                    await this.deviceTokenRepo.save(deviceToken);
                }
            }

            // Remove password from response
            const { password, ...restaurantWithoutPassword } = restaurant;

            return {
                status: 200,
                success: true,
                message: 'Restaurant verified successfully.',
                data: {
                    token,
                    restaurant: restaurantWithoutPassword
                }
            };

        } catch (error) {
            console.error('Restaurant OTP verification error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error during verification.',
                data: null
            };
        }
    }

    /* -------------------------- Restaurant Resend OTP ------------------------ */
    async resendOtp(dto: ResendOtpDto) {
        try {
            // Find restaurant by email
            const restaurant = await this.restaurantRepo.findOne({
                where: { email: dto.email }
            });

            if (!restaurant) {
                return {
                    status: 404,
                    success: false,
                    message: 'Restaurant not found.',
                    data: null
                };
            }

            if (restaurant.is_verified) {
                return {
                    status: 400,
                    success: false,
                    message: 'Restaurant is already verified.',
                    data: null
                };
            }

            // Generate new OTP
            const otpCode = this.generateOtpCode();
            await this.otpRepo.save({
                email: restaurant.email,
                channel: 'email',
                otpCode,
                otpType: 'restaurant_verify',
                expiresAt: this.getOtpExpiry(),
                user: restaurant,
            });

            // Send OTP email
            try {
                                    await this.emailService.sendTemplateNotification({
                        user: {
                            email: restaurant.email,
                            name: restaurant.name
                        },
                        template: 'restaurant-welcome',
                        data: { otp: otpCode },
                    });
            } catch (emailErr) {
                console.error('Failed to send verification email', emailErr);
            }

            return {
                status: 200,
                success: true,
                message: 'OTP resent to your email.',
                data: { email: restaurant.email }
            };

        } catch (error) {
            console.error('Restaurant resend OTP error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error during resend OTP.',
                data: null
            };
        }
    }

    /* -------------------------- Restaurant Menu Management ------------------------ */
    
    /* -------------------------- Get All Menus for Logged-in Restaurant ------------------------ */
    async getMyMenus(restaurantId: number, page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;

            const query = this.menuRepository
                .createQueryBuilder('menu')
                .leftJoinAndSelect('menu.category', 'category')
                .where('menu.restaurantId = :restaurantId', { restaurantId })
                .orderBy('menu.id', 'DESC')
                .skip(skip)
                .take(limit);

            const [menus, total] = await query.getManyAndCount();

            return {
                status: 200,
                success: true,
                message: 'Restaurant menus fetched successfully.',
                data: menus,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Get restaurant menus error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error while fetching menus.',
                data: null
            };
        }
    }

    /* -------------------------- Get Single Menu for Logged-in Restaurant ------------------------ */
    async getRestaurantMenuDetails(restaurantId: number, menuId: number) {
        try {
            const menu = await this.menuRepository.findOne({ where: { id: menuId, restaurantId: restaurantId } });
            if (!menu) {
                return {
                    status: 404,
                    success: false,
                    message: 'Menu not found.',
                    data: null
                };
            }
        return {
            status: 200,
            success: true,
            message: 'Restaurant menu fetched successfully.',
            data: menu
        };
        } catch (error) {
            console.error('Get restaurant menu error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error while fetching menu.',
                data: null
            };
        }
    }

    /* -------------------------- Create New Menu Item ------------------------ */
    async createMenu(restaurantId: number, dto: CreateMenuDto) {
        try {
            // Verify that the category exists
            const category = await this.categoryRepo.findOne({
                where: { id: dto.categoryId }
            });

            if (!category) {
                return {
                    status: 404,
                    success: false,
                    message: 'Category not found.',
                    data: null
                };
            }

            // Create menu item
            const menuItem = this.menuRepository.create({
                ...dto,
                restaurantId: restaurantId,
                inStock: dto.inStock ?? true, // Default to true if not provided
            });

            const savedMenuItem = await this.menuRepository.save(menuItem);

            // Fetch the created menu item with category details
            const menuWithCategory = await this.menuRepository.findOne({
                where: { id: savedMenuItem.id },
                relations: ['category']
            });

            return {
                status: 201,
                success: true,
                message: 'Menu item created successfully.',
                data: menuWithCategory
            };

        } catch (error) {
            console.error('Create menu item error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error while creating menu item.',
                data: null
            };
        }
    }

    /* -------------------------- Update Menu Item ------------------------ */
    async updateMenu(restaurantId: number, menuId: number, dto: Partial<CreateMenuDto>) {
        try {
            // Find the menu item and verify ownership
            const existingMenu = await this.menuRepository.findOne({
                where: { 
                    id: menuId,
                    restaurantId: restaurantId 
                }
            });

            if (!existingMenu) {
                return {
                    status: 404,
                    success: false,
                    message: 'Menu item not found or you do not have permission to update it.',
                    data: null
                };
            }

            // If categoryId is being updated, verify the category exists
            if (dto.categoryId) {
                const category = await this.categoryRepo.findOne({
                    where: { id: dto.categoryId }
                });

                if (!category) {
                    return {
                        status: 404,
                        success: false,
                        message: 'Category not found.',
                        data: null
                    };
                }
            }

            // Update the menu item
            await this.menuRepository.update(menuId, dto);

            // Fetch the updated menu item with category details
            const updatedMenu = await this.menuRepository.findOne({
                where: { id: menuId },
                relations: ['category']
            });

            return {
                status: 200,
                success: true,
                message: 'Menu item updated successfully.',
                data: updatedMenu
            };

        } catch (error) {
            console.error('Update menu item error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error while updating menu item.',
                data: null
            };
        }
    }

    /* -------------------------- Delete Menu Item ------------------------ */
    async deleteMenu(restaurantId: number, menuId: number) {
        try {
            // Find the menu item and verify ownership
            const existingMenu = await this.menuRepository.findOne({
                where: { 
                    id: menuId,
                    restaurantId: restaurantId 
                }
            });

            if (!existingMenu) {
                return {
                    status: 404,
                    success: false,
                    message: 'Menu item not found or you do not have permission to delete it.',
                    data: null
                };
            }

            // Delete the menu item
            await this.menuRepository.delete(menuId);

            return {
                status: 200,
                success: true,
                message: 'Menu item deleted successfully.',
                data: null
            };

        } catch (error) {
            console.error('Delete menu item error:', error);
            return {
                status: 500,
                success: false,
                message: 'Internal server error while deleting menu item.',
                data: null
            };
        }
    }

}
