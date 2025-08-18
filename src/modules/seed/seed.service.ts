import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RoleEntity } from 'src/models';

@Injectable()
export class SeedService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async seedRoles() {
    const count = await this.roleRepository.count();
    if (count > 0) {
      console.log('Roles already seeded. Skipping...');
      return;
    }

    const roles = [
      { name: 'Super Admin', slug: 'super-admin' },
      { name: 'Restaurant', slug: 'restaurant' },
      { name: 'Driver', slug: 'driver' },
      { name: 'User', slug: 'user' },
    ];

    for (const role of roles) {
      const newRole = this.roleRepository.create({
        ...role,
        description: null,
        is_default: 0,
        status: 1,
        created_at: new Date(),
        updated_at: null,
      });
      await this.roleRepository.save(newRole);
    }

    console.log('✅ Roles seeded successfully.');
  }
}
