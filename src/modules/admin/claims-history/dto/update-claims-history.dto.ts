import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateClaimDto {
  @IsOptional() @IsString() property_address?: string;
  @IsOptional() @IsString() type_of_damage?: string;
  @IsOptional() @IsString() insurance_company?: string;
  @IsOptional() @IsString() policy_number?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() adjuster?: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() dateOfClaim?: string;
  @IsOptional() @IsString() agreeWithPolicy?: string;
  @IsOptional() @IsString() policy_docs?: string;
  @IsOptional() @IsArray() damage_photos?: string[];
  @IsOptional() @IsString() signed_forms?: string;
  @IsOptional() @IsString() carrier_correspondence?: string;
  // ...add other fields as needed
}