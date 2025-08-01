import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateClaimDto } from './dto/update-claims-history.dto';

@Injectable()
export class ClaimsHistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const whereCondition: any = {
      deleted_at: null,
    };
  
    if (search) {
      whereCondition.OR = [
        { claim_number: { contains: search, mode: 'insensitive' } },
        { policy_number: { contains: search, mode: 'insensitive' } },
        { type_of_damage: { contains: search, mode: 'insensitive' } },
        { insurance_company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where: whereCondition,
        select: {
          id: true,
          claim_number: true,
          policy_number: true,
          type_of_damage: true,
          insurance_company: true,
          date_of_loss: true,
          status: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.claim.count({ where: whereCondition })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async remove(id: string) {
    return await this.prisma.claim.update({
      where: {
        id: id
      },
      data: {
        deleted_at: new Date(),
      }
    });
  }

  async findById(id: string) {
    try {
      const claimDetails = await this.prisma.claim.findFirst({
        where: { id },
      });
  
      if (!claimDetails) {
        throw new NotFoundException('Claim not found');
      }
  
      const result = {
        ...claimDetails,
        policy_docs: claimDetails.policy_docs
          ? buildFileUrl('policy_docs', claimDetails.policy_docs)
          : null,
        damage_photos: (claimDetails.damage_photos || []).map((f: string) =>
          buildFileUrl('damage_photos', f)
        ),
        signed_forms: claimDetails.signed_forms
          ? buildFileUrl('signed_forms', claimDetails.signed_forms)
          : null,
        carrier_correspondence: claimDetails.carrier_correspondence
          ? buildFileUrl('carrier_correspondence', claimDetails.carrier_correspondence)
          : null,
      };
  
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async updateClaim(id: string, updateClaimDto: UpdateClaimDto) {
    try {
      const updated = await this.prisma.claim.update({
        where: { id },
        data: {
          ...updateClaimDto,
          last_updated: new Date(),
        },
      });
      // Optionally, return with file URLs using your buildFileUrl helper
      return {
        ...updated,
        policy_docs: buildFileUrl('policy_docs', updated.policy_docs),
        damage_photos: (updated.damage_photos || []).map(f => buildFileUrl('damage_photos', f)),
        signed_forms: buildFileUrl('signed_forms', updated.signed_forms),
        carrier_correspondence: buildFileUrl('carrier_correspondence', updated.carrier_correspondence),
      };
    } catch (error) {
      throw new HttpException('Failed to update claim: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateClaimTimeline(id: string, timeline: string) {
    try {
      const updated = await this.prisma.claim.update({
        where: { id },
        data: {
          claim_timeline: timeline,
          last_updated: new Date(),
        },
      });
      return updated;
    } catch (error) {
      throw new HttpException('Failed to update claim timeline: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

// At the top of your controller
const PUBLIC_BASE = '/public/storage'; // or use your full URL if needed

function buildFileUrl(type: string, filename: string | null) {
  if (!filename) return null;
  let folder = '';
  switch (type) {
    case 'policy_docs': folder = 'policy-docs'; break;
    case 'damage_photos': folder = 'damage-photos'; break;
    case 'signed_forms': folder = 'signed-forms'; break;
    case 'carrier_correspondence': folder = 'carrier-correspondence'; break;
  }
  return `${PUBLIC_BASE}/${folder}/${filename}`;
}