
// update-page.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePageDto } from './create-static-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {}
