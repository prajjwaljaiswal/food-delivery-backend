// src/admin/driver/dto/update-verification-document.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificationDocumentDto } from './create-driver-verification.dto';

export class UpdateVerificationDocumentDto extends PartialType(CreateVerificationDocumentDto) {}
