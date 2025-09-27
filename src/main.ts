import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'https://front-commerce-rust.vercel.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); // 👈 important
}
bootstrap();
