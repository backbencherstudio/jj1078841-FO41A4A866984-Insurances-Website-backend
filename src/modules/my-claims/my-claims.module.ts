import { Module } from '@nestjs/common';
import { MyClaimsService } from './my-claims.service';
import { MyClaimsController } from './my-claims.controller';

@Module({
  controllers: [MyClaimsController],
  providers: [MyClaimsService],
})
export class MyClaimsModule {}
