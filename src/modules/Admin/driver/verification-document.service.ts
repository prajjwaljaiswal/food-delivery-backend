import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationDocument } from 'src/models/driver/Verification_documents.entites';
import { Driver } from 'src/models';
import { CreateVerificationDocumentDto } from './dto/create-driver-verification.dto';
import { UpdateVerificationDocumentDto } from './dto/update-verification-document.dto';

@Injectable()
export class VerificationDocumentService {
    constructor(
        @InjectRepository(VerificationDocument)
        private documentRepo: Repository<VerificationDocument>,

        @InjectRepository(Driver)
        private driverRepo: Repository<Driver>,
    ) { }

    async create(driverId: number, dto: CreateVerificationDocumentDto) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) throw new NotFoundException('Driver not found');

        const document = this.documentRepo.create({
            ...dto,
            driver,
        });

        return this.documentRepo.save(document);
    }


    findAll() {
        return this.documentRepo.find({ relations: ['driver'] });
    }

    async findOne(id: number) {
        const doc = await this.documentRepo.findOne({ where: { id }, relations: ['driver'] });
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }

    async update(id: number, dto: UpdateVerificationDocumentDto) {
        const doc = await this.findOne(id);
        Object.assign(doc, dto);
        return this.documentRepo.save(doc);
    }

    async remove(id: number) {
        const doc = await this.findOne(id);
        return this.documentRepo.remove(doc);
    }
}
