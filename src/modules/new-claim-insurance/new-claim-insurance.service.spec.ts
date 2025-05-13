import { Test, TestingModule } from '@nestjs/testing';
import { NewClaimInsuranceService } from './new-claim-insurance.service';

describe('NewClaimInsuranceService', () => {
  let service: NewClaimInsuranceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewClaimInsuranceService],
    }).compile();

    service = module.get<NewClaimInsuranceService>(NewClaimInsuranceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
