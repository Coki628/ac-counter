import { Module } from '@nestjs/common';
import { AcCountController } from './ac-count.controller';
import { AcCountService } from './ac-count.service';

@Module({
  controllers: [AcCountController],
  providers: [AcCountService],
})
export class AcCountModule {}
