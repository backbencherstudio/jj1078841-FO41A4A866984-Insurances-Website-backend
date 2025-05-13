import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform, Type } from 'class-transformer';

export class CreateNewClaimInsuranceDto {
  @IsNotEmpty()
  @IsString()  
  property_address: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    
    // Handle date format like "5/8/25"
    if (typeof value === 'string' && value.includes('/')) {
      const [month, day, year] = value.split('/');
      // Assuming two-digit year format, convert to four digits
      const fullYear = year.length === 2 ? '20' + year : year;
      const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    }
    
    // Handle other date formats
    const date = new Date(value);
    return date.toISOString();
  })
  date_of_loss: Date;

  @IsNotEmpty()
  @IsString()
  type_of_damage: string;

  @IsNotEmpty()
  @IsString()
  insurance_company: string;

  @IsNotEmpty()
  @IsString()
  policy_number: string;

  @IsOptional()
  @IsString()
  policy_docs?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value].filter(Boolean))
  damage_photos?: string[];
  
  @IsOptional()
  @IsString()
  signed_forms?: string;

  @IsOptional()
  @IsString()
  carrier_correspondence?: string;
}