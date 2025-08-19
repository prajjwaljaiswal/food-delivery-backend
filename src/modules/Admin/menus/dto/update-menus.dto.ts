import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuItemDto } from './create-menus.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
