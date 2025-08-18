import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';


@UseGuards(JwtAuthGuard,RoleGuard)
@Roles(RoleEnum.ADMIN) // ✅ Only Admin can access
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  getAllUsers() {
    return this.adminUserService.getAllUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: number) {
    return this.adminUserService.getUserById(id);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.adminUserService.deleteUser(id);
  }
}
