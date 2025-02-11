import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { JwtAuthGuard } from '@modules/auth/guards/jwtAuth.guard';
import { CollaboratorsService } from '@modules/collaborators/collaborators.service';
import { CollaboratorsController } from '@modules/collaborators/collaborators.controller';

class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 1 };
    return true;
  }
}
describe('CollaboratorsController (Integration)', () => {
  let app: INestApplication;
  let service: Partial<CollaboratorsService>;

  beforeAll(async () => {
    service = {
      addCollaborator: jest.fn().mockResolvedValue({
        message: 'Invitation sent successfully',
        data: { id: 2 },
      }),
      acceptInvitation: jest.fn().mockResolvedValue({ id: 2, accepted: true }),
      rejectInvitation: jest
        .fn()
        .mockResolvedValue({ message: 'Invitation rejected' }),
      listCollaborators: jest.fn().mockResolvedValue([
        {
          id: 2,
          username: 'collab',
          email: 'collab@example.com',
          accepted: true,
        },
      ]),
      removeCollaborator: jest
        .fn()
        .mockResolvedValue({ message: 'Collaborator removed successfully' }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorsController],
      providers: [{ provide: CollaboratorsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /collaborators - should add collaborator', async () => {
    const response = await request(app.getHttpServer())
      .post('/collaborators')
      .send({ identifier: 'collab@example.com' })
      .expect(201);
    expect(service.addCollaborator).toHaveBeenCalledWith(
      1,
      'collab@example.com',
    );
    expect(response.body).toEqual({
      message: 'Invitation sent successfully',
      data: { id: 2 },
    });
  });

  it('POST /collaborators/accept - should accept invitation', async () => {
    const response = await request(app.getHttpServer())
      .post('/collaborators/accept')
      .send({ ownerId: 1 })
      .expect(201);
    expect(service.acceptInvitation).toHaveBeenCalledWith(1, 1);
    expect(response.body).toEqual({
      message: 'Invitation accepted',
      data: { id: 2, accepted: true },
    });
  });

  it('GET /collaborators - should list collaborators', async () => {
    const response = await request(app.getHttpServer())
      .get('/collaborators')
      .expect(200);
    expect(service.listCollaborators).toHaveBeenCalledWith(1);
    expect(response.body).toEqual({
      message: 'Collaborators retrieved successfully',
      data: [
        {
          id: 2,
          username: 'collab',
          email: 'collab@example.com',
          accepted: true,
        },
      ],
    });
  });

  it('DELETE /collaborators/leave - should leave collaboration', async () => {
    const response = await request(app.getHttpServer())
      .delete('/collaborators/leave')
      .query({ ownerId: 1 })
      .expect(200);
    expect(service.removeCollaborator).toHaveBeenCalledWith(1, 1);
    expect(response.body).toEqual({
      message: 'Collaborator removed successfully',
    });
  });

  it('DELETE /collaborators/:collaboratorId - should remove collaborator as owner', async () => {
    const response = await request(app.getHttpServer())
      .delete('/collaborators/2')
      .expect(200);
    expect(service.removeCollaborator).toHaveBeenCalledWith(1, 2);
    expect(response.body).toEqual({
      message: 'Collaborator removed successfully',
    });
  });
});