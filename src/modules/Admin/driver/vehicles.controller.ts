import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/driver/vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }
    // vehicle.controller.ts
    @Post(':driverId')
    create(
        @Param('driverId') driverId: number,
        @Body() createVehicleDto: CreateVehicleDto
    ) {
        return this.vehiclesService.create(driverId, createVehicleDto);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.vehiclesService.findAll(Number(page) || 1, Number(limit) || 10);
    }


    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.vehiclesService.findOne(id);
    }

    // @Patch(':id')
    // update(@Param('id', ParseIntPipe) id: number, @Body() updateVehicleDto: UpdateVehicleDto) {
    //     return this.vehiclesService.update(id, updateVehicleDto);
    // }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.vehiclesService.remove(id);
    }
}
