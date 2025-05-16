import { Test, TestingModule } from '@nestjs/testing';
import { MyClaimsService } from './my-claims.service';

describe('MyClaimsService', () => {
  let service: MyClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyClaimsService],
    }).compile();

    service = module.get<MyClaimsService>(MyClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
