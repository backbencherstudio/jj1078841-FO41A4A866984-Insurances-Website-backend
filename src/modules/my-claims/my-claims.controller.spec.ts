import { Test, TestingModule } from '@nestjs/testing';
import { MyClaimsController } from './my-claims.controller';
import { MyClaimsService } from './my-claims.service';

describe('MyClaimsController', () => {
  let controller: MyClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyClaimsController],
      providers: [MyClaimsService],
    }).compile();

    controller = module.get<MyClaimsController>(MyClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
