import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; //ADDED

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //ADDED
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // your frontend URL
    credentials: true, // if sending cookies or auth headers
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
