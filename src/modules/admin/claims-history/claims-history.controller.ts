import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ClaimsHistoryService } from './claims-history.service';
import { CreateClaimsHistoryDto } from './dto/create-claims-history.dto';
import { UpdateClaimDto } from './dto/update-claims-history.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';

@Controller('admin/claims-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClaimsHistoryController {
  constructor(private readonly claimsHistoryService: ClaimsHistoryService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return this.claimsHistoryService.findAll(search, +page, +limit);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.claimsHistoryService.remove(id);
      return {
        message: 'Claim deleted successfully'
      }
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async getClaimDetailsBYID(@Param('id') id:string){
    const response = await this.claimsHistoryService.findById(id)
    return response
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'policy_docs', maxCount: 1 },
    { name: 'damage_photos', maxCount: 10 },
    { name: 'signed_forms', maxCount: 1 },
    { name: 'carrier_correspondence', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, callback) => {
        let uploadPath = path.join(process.cwd(), 'public', 'storage');
        switch (file.fieldname) {
          case 'policy_docs':
            uploadPath = path.join(uploadPath, 'policy-docs');
            break;
          case 'damage_photos':
            uploadPath = path.join(uploadPath, 'damage-photos');
            break;
          case 'signed_forms':
            uploadPath = path.join(uploadPath, 'signed-forms');
            break;
          case 'carrier_correspondence':
            uploadPath = path.join(uploadPath, 'carrier-correspondence');
            break;
        }
        require('fs').mkdirSync(uploadPath, { recursive: true });
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type.'), false);
      }
    }
  }))
  async updateClaim(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @UploadedFiles() files: {
      policy_docs?: Express.Multer.File[],
      damage_photos?: Express.Multer.File[],
      signed_forms?: Express.Multer.File[],
      carrier_correspondence?: Express.Multer.File[]
    }
  ) {
    // Attach new file names to DTO if uploaded
    if (files.policy_docs?.[0]) updateClaimDto.policy_docs = files.policy_docs[0].filename;
    if (files.damage_photos) updateClaimDto.damage_photos = files.damage_photos.map(f => f.filename);
    if (files.signed_forms?.[0]) updateClaimDto.signed_forms = files.signed_forms[0].filename;
    if (files.carrier_correspondence?.[0]) updateClaimDto.carrier_correspondence = files.carrier_correspondence[0].filename;

    return this.claimsHistoryService.updateClaim(id, updateClaimDto);
  }

  @Patch(':id/timeline')
  async updateClaimTimeline(
    @Param('id') id: string,
    @Body() body: { claim_timeline: string }
  ) {
    return this.claimsHistoryService.updateClaimTimeline(id, body.claim_timeline);
  }
}
