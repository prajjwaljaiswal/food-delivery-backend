import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from './users.service';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('placed/order')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(RoleEnum.USER)
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.usersService.createOrder(createOrderDto);
    }


}
