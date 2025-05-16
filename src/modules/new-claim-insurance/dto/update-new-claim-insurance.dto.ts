import { PartialType } from '@nestjs/swagger';
import { CreateNewClaimInsuranceDto } from './create-new-claim-insurance.dto';

export class UpdateNewClaimInsuranceDto extends PartialType(CreateNewClaimInsuranceDto) {}
