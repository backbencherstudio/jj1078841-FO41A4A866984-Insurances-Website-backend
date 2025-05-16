import { Controller, Post, Body, UseInterceptors, UploadedFiles, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NewClaimInsuranceService } from './new-claim-insurance.service';
import { CreateNewClaimInsuranceDto } from './dto/create-new-claim-insurance.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('new-claim-insurance')
export class NewClaimInsuranceController {
  constructor(private readonly newClaimInsuranceService: NewClaimInsuranceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'policy_docs', maxCount: 1 },
    { name: 'damage_photos', maxCount: 10 },
    { name: 'signed_forms', maxCount: 1 },
    { name: 'carrier_correspondence', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, callback) => {
        let uploadPath = './uploads/';
        switch (file.fieldname) {
          case 'policy_docs':
            uploadPath += 'policy-docs';
            break;
          case 'damage_photos':
            uploadPath += 'damage-photos';
            break;
          case 'signed_forms':
            uploadPath += 'signed-forms';
            break;
          case 'carrier_correspondence':
            uploadPath += 'carrier-correspondence';
            break;
        }
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        } catch (error) {
          callback(new HttpException('Error processing file', HttpStatus.BAD_REQUEST), null);
        }
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit per file
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new HttpException('Invalid file type. Only images, PDFs and Word documents are allowed.', HttpStatus.BAD_REQUEST), false);
      }
    }
  }))
  async create(
    @Request() req,
    @Body() createNewClaimInsuranceDto: CreateNewClaimInsuranceDto,
    @UploadedFiles() files: { 
      policy_docs?: Express.Multer.File[],
      damage_photos?: Express.Multer.File[],
      signed_forms?: Express.Multer.File[],
      carrier_correspondence?: Express.Multer.File[]
    },
  ) {
    try {
      if (files.policy_docs?.[0]) {
        createNewClaimInsuranceDto.policy_docs = files.policy_docs[0].filename;
      }
      if (files.damage_photos) {
        createNewClaimInsuranceDto.damage_photos = files.damage_photos.map(file => file.filename);
      }
      if (files.signed_forms?.[0]) {
        createNewClaimInsuranceDto.signed_forms = files.signed_forms[0].filename;
      }
      if (files.carrier_correspondence?.[0]) {
        createNewClaimInsuranceDto.carrier_correspondence = files.carrier_correspondence[0].filename;
      }
      return await this.newClaimInsuranceService.create(createNewClaimInsuranceDto, req.user.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating claim insurance',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
