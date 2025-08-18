import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}
