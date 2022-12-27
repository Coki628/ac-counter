import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // cors enabled
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  // 普通にこれでも取れる
  // const port = process.env.PORT;
  // console.log(port);

  await app.listen(port);

  // console.log(`app is runnning on port ${port}`);
}
bootstrap();
