import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
    ) { }

    async getAllUsers() {
        return this.userRepo.find({
            where: {
                role: {
                    id: 4, // Assuming role ID 4 = customer
                },
            }, // ✅ Assuming role_id 4 = Customer
        });
    }

    async getUserById(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async deleteUser(id: number) {
        const result = await this.userRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('User not found');
        return { message: 'User deleted successfully' };
    }
}
