import { Test, TestingModule } from '@nestjs/testing';
import { NewClaimInsuranceController } from './new-claim-insurance.controller';
import { NewClaimInsuranceService } from './new-claim-insurance.service';

describe('NewClaimInsuranceController', () => {
  let controller: NewClaimInsuranceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewClaimInsuranceController],
      providers: [NewClaimInsuranceService],
    }).compile();

    controller = module.get<NewClaimInsuranceController>(NewClaimInsuranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
