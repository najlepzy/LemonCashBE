import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as request from 'supertest';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';

@Controller('test-exceptions')
class TestExceptionsController {
  @Get('http')
  throwHttpException() {
    throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  }

  @Get('generic')
  throwGenericError() {
    throw new Error('Something went wrong');
  }
}

describe('AllExceptionsFilter Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TestExceptionsController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should catch HttpException and return proper response', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-exceptions/http')
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        path: '/test-exceptions/http',
      }),
    );
  });

  it('should catch generic errors as internal server error', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-exceptions/generic')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/test-exceptions/generic',
      }),
    );
  });
});