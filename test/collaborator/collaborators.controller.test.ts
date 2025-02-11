import { CollaboratorsController } from '@modules/collaborators/collaborators.controller';
import { CollaboratorsService } from '@modules/collaborators/collaborators.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

describe('CollaboratorsController', () => {
  let controller: CollaboratorsController;
  let service: Partial<CollaboratorsService>;

  beforeEach(async () => {
    service = {
      addCollaborator: jest.fn().mockResolvedValue({
        message: 'Invitation sent successfully',
        data: { id: 1 },
      }),
      acceptInvitation: jest.fn().mockResolvedValue({ id: 1, accepted: true }),
      rejectInvitation: jest
        .fn()
        .mockResolvedValue({ message: 'Invitation rejected' }),
      listCollaborators: jest.fn().mockResolvedValue([
        {
          id: 1,
          username: 'collab',
          email: 'collab@example.com',
          accepted: true,
        },
      ]),
      removeCollaborator: jest
        .fn()
        .mockResolvedValue({ message: 'Collaborator removed successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorsController],
      providers: [{ provide: CollaboratorsService, useValue: service }],
    }).compile();

    controller = module.get<CollaboratorsController>(CollaboratorsController);
  });

  it('should add a collaborator', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const identifier = 'collab@example.com';
    const result = await controller.add(req, identifier);
    expect(service.addCollaborator).toHaveBeenCalledWith(1, identifier);
    expect(result).toEqual({
      message: 'Invitation sent successfully',
      data: { id: 1 },
    });
  });

  it('should accept an invitation', async () => {
    const req = { user: { sub: 2 } } as unknown as Request;
    const ownerId = 1;
    const result = await controller.acceptInvitation(req, ownerId);
    expect(service.acceptInvitation).toHaveBeenCalledWith(ownerId, 2);
    expect(result).toEqual({
      message: 'Invitation accepted',
      data: { id: 1, accepted: true },
    });
  });

  it('should reject an invitation', async () => {
    const req = { user: { sub: 2 } } as unknown as Request;
    const ownerId = 1;
    const result = await controller.rejectInvitation(req, ownerId);
    expect(service.rejectInvitation).toHaveBeenCalledWith(ownerId, 2);
    expect(result).toEqual({ message: 'Invitation rejected' });
  });

  it('should list collaborators', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const result = await controller.list(req);
    expect(service.listCollaborators).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      message: 'Collaborators retrieved successfully',
      data: [
        {
          id: 1,
          username: 'collab',
          email: 'collab@example.com',
          accepted: true,
        },
      ],
    });
  });

  it('should leave collaboration', async () => {
    const req = { user: { sub: 2 } } as unknown as Request;
    const ownerId = 1;
    const result = await controller.leaveCollaboration(req, ownerId);
    expect(service.removeCollaborator).toHaveBeenCalledWith(ownerId, 2);
    expect(result).toEqual({ message: 'Collaborator removed successfully' });
  });

  it('should remove collaborator as owner', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const collaboratorId = 2;
    const result = await controller.remove(req, collaboratorId);
    expect(service.removeCollaborator).toHaveBeenCalledWith(1, collaboratorId);
    expect(result).toEqual({ message: 'Collaborator removed successfully' });
  });
});