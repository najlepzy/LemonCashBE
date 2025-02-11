import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { CollaboratorsModule } from '@modules/collaborators/collaborators.module';
import { CollaboratorsService } from '@modules/collaborators/collaborators.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwtAuth.guard';

class MockAuthGuard {
  canActivate(context: any) {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 1 };
    return true;
  }
}

describe('CollaboratorsModule (Integration)', () => {
  let app: INestApplication;
  let collaboratorsService: CollaboratorsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CollaboratorsModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    collaboratorsService =
      moduleFixture.get<CollaboratorsService>(CollaboratorsService);

    jest.spyOn(collaboratorsService, 'addCollaborator').mockResolvedValue({
      message: 'Invitation sent successfully',
      data: {
        id: 1,
        ownerId: 1,
        collaboratorId: 2,
        accepted: false,
        collaborator: {
          id: 2,
          username: 'collab',
          email: 'collab@example.com',
        },
      },
    });

    jest.spyOn(collaboratorsService, 'listCollaborators').mockResolvedValue([
      {
        id: 2,
        username: 'collab',
        email: 'collab@example.com',
        accepted: true,
      },
    ]);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /collaborators should add a collaborator', async () => {
    const response = await request(app.getHttpServer())
      .post('/collaborators')
      .send({ identifier: 'collab@example.com' })
      .expect(201);

    expect(response.body).toEqual({
      message: 'Invitation sent successfully',
      data: {
        id: 1,
        ownerId: 1,
        collaboratorId: 2,
        accepted: false,
        collaborator: {
          id: 2,
          username: 'collab',
          email: 'collab@example.com',
        },
      },
    });
  });

  it('GET /collaborators should list collaborators', async () => {
    const response = await request(app.getHttpServer())
      .get('/collaborators')
      .expect(200);

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
});