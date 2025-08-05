import { Controller, Post, Body, UseInterceptors, UploadedFiles, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NewClaimInsuranceService } from './new-claim-insurance.service';
import { CreateNewClaimInsuranceDto } from './dto/create-new-claim-insurance.dto';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { SubscriberGuard } from '../payment/stripe/guards/subscriber.guard';

@Controller('new-claim-insurance')
export class NewClaimInsuranceController {
  constructor(private readonly newClaimInsuranceService: NewClaimInsuranceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, )
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'policy_docs', maxCount: 1 },
    { name: 'damage_photos', maxCount: 10 },
    { name: 'signed_forms', maxCount: 1 },
    { name: 'carrier_correspondence', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, callback) => {
        try {
          if (!file || !file.fieldname) {
            return callback(
              new HttpException('Invalid file field name', HttpStatus.BAD_REQUEST),
              null,
            );
          }
      
          const basePath = path.join(process.cwd(), 'public', 'storage');
      
          const folderMap = {
            policy_docs: 'policy-docs',
            damage_photos: 'damage-photos',
            signed_forms: 'signed-forms',
            carrier_correspondence: 'carrier-correspondence',
          };
      
          const subFolder = folderMap[file.fieldname];
      
          if (!subFolder) {
            return callback(
              new HttpException('Unsupported file field', HttpStatus.BAD_REQUEST),
              null,
            );
          }
      
          const uploadPath = path.join(basePath, subFolder);
      
          // Import this at the top: import * as fs from 'fs';
          const fs = require('fs');
          fs.mkdirSync(uploadPath, { recursive: true });
      
          callback(null, uploadPath);
        } catch (err) {
          callback(
            new HttpException('Error setting upload path', HttpStatus.INTERNAL_SERVER_ERROR),
            null,
          );
        }
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
      fileSize: 50 * 1024 * 1024, // 50MB limit per file
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
      }3
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
