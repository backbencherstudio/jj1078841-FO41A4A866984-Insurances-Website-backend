import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsHistoryService } from './claims-history.service';

describe('ClaimsHistoryService', () => {
  let service: ClaimsHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimsHistoryService],
    }).compile();

    service = module.get<ClaimsHistoryService>(ClaimsHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
