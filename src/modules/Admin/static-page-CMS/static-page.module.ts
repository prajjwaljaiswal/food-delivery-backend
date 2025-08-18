
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from 'src/models';
import { PageController } from './static-page.controller';
import { PageService } from './static-page.service';


@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}
