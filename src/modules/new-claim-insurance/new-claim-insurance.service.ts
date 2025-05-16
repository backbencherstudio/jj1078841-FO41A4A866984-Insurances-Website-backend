import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewClaimInsuranceDto } from './dto/create-new-claim-insurance.dto';

@Injectable()
export class NewClaimInsuranceService {
  constructor(private prisma: PrismaService) {}

  async create(createNewClaimInsuranceDto: CreateNewClaimInsuranceDto, userId: string) {
    try {
      // Transform date_of_loss to ISO format
      let dateOfLoss: Date;
      const dateInput = createNewClaimInsuranceDto.date_of_loss as string | Date;
      
      if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const [month, day, year] = dateInput.split('/');
        const fullYear = year.length === 2 ? '20' + year : year;
        dateOfLoss = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
      } else {
        dateOfLoss = new Date(dateInput);
      }

      const claim = await this.prisma.claim.create({
        data: {
          claim_number: `CLM-${Date.now()}`,
          status: 'Inspection Scheduled',
          property_address: createNewClaimInsuranceDto.property_address,
          type_of_damage: createNewClaimInsuranceDto.type_of_damage,
          carrier: createNewClaimInsuranceDto.insurance_company, // Add carrier field
          insurance_company: createNewClaimInsuranceDto.insurance_company,
          adjuster: 'Pending Assignment',
          policy_docs: createNewClaimInsuranceDto.policy_docs,
          damage_photos: createNewClaimInsuranceDto.damage_photos || [],
          signed_forms: createNewClaimInsuranceDto.signed_forms,
          carrier_correspondence: createNewClaimInsuranceDto.carrier_correspondence,
          date_of_loss: dateOfLoss,
          policy_number: createNewClaimInsuranceDto.policy_number,
          acv_status: 'Pending',
          rcv_status: 'Pending',
          depreciation_status: 'Pending',
          mortgage_status: 'Required',
          last_updated: new Date(),
          user: {
            connect: {
              id: userId
            }
          }
        }
      });

      return claim;
    } catch (error) {
      throw new HttpException(
        `Failed to create claim: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
