import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFiles, ParseIntPipe } from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VerificationDocumentService } from './verification-document.service';
import { UpdateVerificationDocumentDto } from './dto/update-verification-document.dto';
import { CreateVerificationDocumentDto } from './dto/create-driver-verification.dto';

@Controller('admin/driver/verification-documents')
export class VerificationDocumentController {
    constructor(private readonly verificationService: VerificationDocumentService) { }


    @Post(':driverId')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'drivingLicense', maxCount: 1 },
        { name: 'idProof', maxCount: 1 },
        { name: 'backgroundCheck', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: './uploads/driver-documents',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            },
        }),
    }))

  async create(
    @Param('driverId', ParseIntPipe) driverId: number,
    @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
    @Body() dto: CreateVerificationDocumentDto,
) {
    const filePaths: CreateVerificationDocumentDto = {
        drivingLicense: files.drivingLicense?.[0]?.path,
        idProof: files.idProof?.[0]?.path,
        backgroundCheck: files.backgroundCheck?.[0]?.path,
        addressProof: files.addressProof?.[0]?.path,
    };

    return this.verificationService.create(driverId, { ...dto, ...filePaths });
}


    @Get()
    findAll() {
        return this.verificationService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.verificationService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() dto: UpdateVerificationDocumentDto) {
        return this.verificationService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.verificationService.remove(id);
    }
}
