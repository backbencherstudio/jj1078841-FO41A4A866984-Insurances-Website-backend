import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return `This action returns all dashboard`;
  }

  async getClaimSummary(claimNumber: string) {
    try {
      const claim = await this.prisma.claim.findUnique({
        where: { claim_number: claimNumber },
        select: {
          claim_number: true,
          status: true,
          carrier: true,
          adjuster: true,
          last_updated: true,
          policy_docs: true,
          damage_photos: true,
          signed_forms: true,
          carrier_correspondence: true,
          acv_status: true,
          rcv_status: true,
          depreciation_status: true,
          mortgage_status: true,
        },
      });

      if (!claim) {
        throw new NotFoundException(`Claim with number ${claimNumber} not found`);
      }

      return {
        claimSummary: {
          claimNumber: claim.claim_number,
          status: claim.status,
          carrier: claim.carrier,
          adjuster: claim.adjuster,
          lastUpdated: claim.last_updated,
        },
        documentHub: {
          policyDocs: claim.policy_docs,
          damagePhotos: claim.damage_photos,
          signedForms: claim.signed_forms,
          carrierCorrespondence: claim.carrier_correspondence,
        },
        paymentTracker: {
          acvStatus: claim.acv_status,
          rcvStatus: claim.rcv_status,
          depreciation: claim.depreciation_status,
          mortgageEndorsement: claim.mortgage_status,
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch claim summary: ${error.message}`);
    }
  }
}
