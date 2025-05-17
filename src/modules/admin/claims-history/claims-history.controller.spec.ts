import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsHistoryController } from './claims-history.controller';
import { ClaimsHistoryService } from './claims-history.service';

describe('ClaimsHistoryController', () => {
  let controller: ClaimsHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsHistoryController],
      providers: [ClaimsHistoryService],
    }).compile();

    controller = module.get<ClaimsHistoryController>(ClaimsHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
