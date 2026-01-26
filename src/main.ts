import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; //ADDED
import { NestExpressApplication } from "@nestjs/platform-express" //for ip address

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,           // Strips properties not in DTO
      forbidNonWhitelisted: true, // Throws error if extra properties sent (recommended)
      transform: true,            // Auto-transform payloads to DTO instances
    })); //ADDED
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // your frontend URL
    credentials: true, // if sending cookies or auth headers
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
