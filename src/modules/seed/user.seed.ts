import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLE_IDS } from 'src/common/Constants';
import { RoleEntity, UserEntity } from 'src/models';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async seedUsers() {
    const superAdmin = await this.userRepo.find({
      where: {
        role: {
          id: ROLE_IDS.SUPER_ADMIN,
        },
      },
    });

    if (superAdmin.length > 0) {
      console.log('Super Admin already seeded. Skipping...');
      return;
    }

    const password = await bcrypt.hash('superadmin@123', 10);

    const superAdminData = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@example.com',
        password: password,
        role: {
          id: ROLE_IDS.SUPER_ADMIN,
        },
        isVerified: true,
        isOtpVerified: true,
      },
    ];

    for (const user of superAdminData) {
      const newUser = this.userRepo.create(user);
      await this.userRepo.save(newUser);
    }

    console.log('Super Admin seeded successfully.');
  }
}
