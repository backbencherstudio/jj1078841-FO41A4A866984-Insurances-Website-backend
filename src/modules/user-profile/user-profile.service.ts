import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private prisma: PrismaService) {}

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto) {
    this.logger.debug(`Starting profile update for user `);
    
    try {
      // Handle password validation and hashing
      if (updateUserProfileDto.password) {
        if (updateUserProfileDto.password !== updateUserProfileDto.confirm_password) {
          throw new BadRequestException('Passwords do not match');
        }
        this.logger.debug('Hashing new password');
        const hashedPassword = await bcrypt.hash(updateUserProfileDto.password, 10);
        updateUserProfileDto.password = hashedPassword;
      }
      
      // Extract special-case fields so they are not passed directly to Prisma
      // 1. confirm_password – never stored
      // 2. password         – hashed separately
      // 3. date_of_birth    – cast to Date
      // 4. full_name        – needs to be split into first_name & last_name (not stored directly)
      const {
        confirm_password,
        password,
        date_of_birth,
        full_name,
        ...otherFields
      } = updateUserProfileDto;

      // Prepare name parts if full_name provided (e.g. "John Doe Smith" -> first_name: "John", last_name: "Doe Smith")
      let firstName: string | undefined;
      let lastName: string | undefined;
      if (full_name && full_name.trim().length > 0) {
        const nameParts = full_name.trim().split(/\s+/);
        firstName = nameParts.shift();
        lastName = nameParts.length ? nameParts.join(' ') : undefined;
      }

      // Aggregate data that can safely be sent to Prisma
      const updateData: Record<string, any> = {
        ...otherFields,                       // remaining scalar fields from DTO
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
      };
      
      // Convert date_of_birth to ISO format if provided
      let dateOfBirth;
      if (date_of_birth) {
        dateOfBirth = new Date(date_of_birth).toISOString();
      }
      
      this.logger.debug('Hashing new password');
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true }
      });
      this.logger.debug('Existing user');
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.debug('Updating user profile in database');
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          ...(password && { password }),
          ...(dateOfBirth && { date_of_birth: dateOfBirth }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          date_of_birth: true,
          country: true,
          state: true,
          city: true,
          address: true,
          zip_code: true,
          avatar: true,
        },
      });

      // Combine first_name and last_name for response
      const response = {
        ...updatedUser,
        full_name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
      };

      this.logger.debug('Profile update completed successfully');
      return response;
    } catch (error) {
      this.logger.error(`Error updating profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateAvatar(id: string, avatarUrl: string) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          avatar: avatarUrl,
          updated_at: new Date(),
        },
        select: {
          id: true,
          avatar: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
