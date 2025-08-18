
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from 'src/models';
import { CreatePageDto } from './dto/create-static-page.dto';
import { UpdatePageDto } from './dto/update-static-page.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  create(dto: CreatePageDto) {
    const page = this.pageRepo.create(dto);
    return this.pageRepo.save(page);
  }

  findAll() {
    return this.pageRepo.find();
  }

  findOne(id: number) {
    return this.pageRepo.findOneBy({ id });
  }

  async update(id: number, dto: UpdatePageDto) {
    await this.pageRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.pageRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Page not found');
    return { message: 'Page deleted successfully' };
  }
}