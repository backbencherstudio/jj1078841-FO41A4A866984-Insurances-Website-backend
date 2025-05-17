import { PartialType } from '@nestjs/swagger';
import { CreateClaimsHistoryDto } from './create-claims-history.dto';

export class UpdateClaimsHistoryDto extends PartialType(CreateClaimsHistoryDto) {}
