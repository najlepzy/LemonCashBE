import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use(compression());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('PORT');
    if (!PORT) throw new Error('Environment variable PORT is not defined');

    await app.listen(PORT);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
}

bootstrap();
