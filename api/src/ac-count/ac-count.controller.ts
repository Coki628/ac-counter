import { Body, Controller, Post } from '@nestjs/common';
import { AcCountInput } from './ac-count.dto';
import { AcCountService } from './ac-count.service';

@Controller('ac-count')
export class AcCountController {
  constructor(private readonly acCountService: AcCountService) {}

  @Post()
  async getAcCount(@Body() input: AcCountInput): Promise<(number | null)[]> {
    return this.acCountService.getAcCount(input);
  }
}
