import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, raw } from 'express';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express'; // ✅ optional for types

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://10.0.2.15:3000',
      'https://front-commerce-rust.vercel.app', // fallback old domain
      /\.vercel\.app$/, // allow any vercel.app subdomain
    ],
    credentials: true,
  });
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  //   res.removeHeader('ETag');
  //   next();
  // });
  app.use('/payments/webhook', raw({ type: '*/*' }));
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); // 👈 important
}
bootstrap();
