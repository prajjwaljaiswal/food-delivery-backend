import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationDocument } from 'src/models/driver/Verification_documents.entites';
import { VerificationDocumentController } from './verification-document.controller';
import { VerificationDocumentService } from './verification-document.service';
import { Driver } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationDocument, Driver])],
  controllers: [VerificationDocumentController],
  providers: [VerificationDocumentService],
})
export class VerificationDocumentModule { }
