import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';



@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService, private mailservice:MailService) {}

  findAll() {
    return `This action returns all dashboard`;
  }

  async getClaimSummary(claimNumber: string) {
    try {
      const claim = await this.prisma.claim.findFirst({
        where: { 
          claim_number: claimNumber 
        },
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

  async sendMessageToAdmin(message, userId){

    try {

      const userExist = await this.prisma.user.findFirst({
        where: {
          id: userId
        }
      })
      if(!userExist){
        throw new HttpException('You are not logged in', HttpStatus.BAD_GATEWAY)
      }
      await this.mailservice.sendMessageToAdmin({email: userExist.email, phone_number: userExist.phone_number, message})

      return {
        status: 200,
        success: true,
        message: "Message Send To InsuranceAllay Email Successfully"
      }
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
