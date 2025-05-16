import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  UseGuards, 
  Request, 
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('dashboard/user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Patch()
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file || file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async update(
    @Request() req, 
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      // If file is uploaded, add the avatar URL to the DTO
      if (file) {
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        updateUserProfileDto.avatar = avatarUrl;
      }
      return await this.userProfileService.update(req.user.userId, updateUserProfileDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error updating profile');
    }
  }
}
