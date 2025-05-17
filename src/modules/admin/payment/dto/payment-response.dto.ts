export class PaymentResponseDto {
  claim_id: string;
  policy_number: string;
  type_of_damage: string;
  insurance_company: string;
  date_of_loss: Date;
  payment: number;
  status: string;
}