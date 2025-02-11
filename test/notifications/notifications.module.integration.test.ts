import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationsModule } from '@notifications/notifications.module';
import { NotificationsGateway } from '@notifications/notifications.gateway';

describe('NotificationsModule (Integration)', () => {
  let app: INestApplication;
  let notificationsGateway: NotificationsGateway;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    notificationsGateway = app.get<NotificationsGateway>(NotificationsGateway);
    jest
      .spyOn(notificationsGateway, 'sendCollaboratorInvite')
      .mockImplementation(() => {});
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /notifications/test should emit event and return message', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications/test?userId=1')
      .expect(200);

    expect(response.body).toEqual({ message: 'Event emitted' });
    expect(notificationsGateway.sendCollaboratorInvite).toHaveBeenCalledWith(
      1,
      {
        message: 'Test message from the backend',
      },
    );
  });
});