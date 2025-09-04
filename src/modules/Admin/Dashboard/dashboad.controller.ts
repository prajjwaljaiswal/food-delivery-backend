import { Body, Controller, Get, Headers, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminDashboardService } from './dashboad.service';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProfileDto } from './dto/UpdateProfileDto';
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get()
  async getStats() {
    return await this.dashboardService.getDashboardStats();
  }


  @Get('me')
  async getMe(@Headers('Authorization') authHeader: string) {
    if (!authHeader) return { success: false, status: 401, message: 'No token provided.' };
    const token = authHeader.replace('Bearer ', '').trim();
    return this.dashboardService.getAdminData(token);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|avif)$/)) {
          return cb(new Error('Only image files (jpeg, jpg, png) are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    }),
  )
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateProfileDto,
    @Req() req: any,
  ) {
    return this.dashboardService.updateProfile(req.user.id, dto, file);
  }

}
