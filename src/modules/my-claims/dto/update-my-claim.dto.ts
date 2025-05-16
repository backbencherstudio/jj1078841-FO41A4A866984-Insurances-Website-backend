import { PartialType } from '@nestjs/swagger';
import { CreateMyClaimDto } from './create-my-claim.dto';

export class UpdateMyClaimDto extends PartialType(CreateMyClaimDto) {}
