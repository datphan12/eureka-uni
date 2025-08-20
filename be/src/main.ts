import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
  origin: [
    process.env.FRONT_END_URL,
    'http://localhost:3000',
    'http://localhost:5173', // cho Vite
    'https://fe-kappa-six.vercel.app' // backup nếu env không load
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

  console.log(`🚀 Server running on port: ${process.env.PORT}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONT_END_URL}`);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
