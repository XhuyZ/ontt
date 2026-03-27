import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://api.opnhuatuankiet.io.vn',
      'https://opnhuatuankiet.io.vn',
      'https://kiet.opnhuatuankiet.io.vn',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Op Nhua Tuan Kiet')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
