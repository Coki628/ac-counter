import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcCountModule } from './ac-count/ac-count.module';

@Module({
  imports: [ConfigModule.forRoot(), AcCountModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
