import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { createTestCollaboratorsService } from './collaborators.service.base.test';

describe('CollaboratorsService - addCollaborator', () => {
  const ownerId = 1;
  const collaboratorIdentifier = 'collab@example.com';
  const collaboratorUser = {
    id: 2,
    username: 'collab',
    email: 'collab@example.com',
  };

  let service: any;
  let prisma: any;
  let usersService: any;
  let notificationsGateway: any;

  beforeEach(() => {
    const setup = createTestCollaboratorsService();
    service = setup.service;
    prisma = setup.prisma;
    usersService = setup.usersService;
    notificationsGateway = setup.notificationsGateway;
  });

  it('should throw NotFoundException if collaborator not found', async () => {
    (usersService.findByIdentifier as jest.Mock).mockResolvedValue(null);
    await expect(
      service.addCollaborator(ownerId, collaboratorIdentifier),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if collaborator is owner', async () => {
    (usersService.findByIdentifier as jest.Mock).mockResolvedValue({
      id: ownerId,
    });
    await expect(
      service.addCollaborator(ownerId, collaboratorIdentifier),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if relationship already exists', async () => {
    (usersService.findByIdentifier as jest.Mock).mockResolvedValue(
      collaboratorUser,
    );
    (prisma.userCollaborator.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
    });
    await expect(
      service.addCollaborator(ownerId, collaboratorIdentifier),
    ).rejects.toThrow(ConflictException);
  });

  it('should add collaborator successfully', async () => {
    (usersService.findByIdentifier as jest.Mock).mockResolvedValue(
      collaboratorUser,
    );
    (prisma.userCollaborator.findUnique as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 100,
        ownerId,
        collaboratorId: collaboratorUser.id,
        accepted: false,
        collaborator: {
          id: collaboratorUser.id,
          username: collaboratorUser.username,
          email: collaboratorUser.email,
        },
      });
    (prisma.userCollaborator.create as jest.Mock).mockResolvedValue({});
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: ownerId,
      username: 'owner',
      email: 'owner@example.com',
    });

    const result = await service.addCollaborator(
      ownerId,
      collaboratorIdentifier,
    );

    expect(prisma.userCollaborator.findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        ownerId_collaboratorId: {
          ownerId,
          collaboratorId: collaboratorUser.id,
        },
      },
    });
    expect(prisma.userCollaborator.create).toHaveBeenCalledWith({
      data: { ownerId, collaboratorId: collaboratorUser.id },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: ownerId },
    });
    expect(notificationsGateway.sendCollaboratorInvite).toHaveBeenCalledWith(
      collaboratorUser.id,
      {
        message: 'You have been invited to collaborate on a board',
        ownerId,
        ownerName: 'owner',
        collaboratorId: collaboratorUser.id,
      },
    );
    expect(result).toEqual({
      message: 'Invitation sent successfully',
      data: {
        id: 100,
        ownerId,
        collaboratorId: collaboratorUser.id,
        accepted: false,
        collaborator: {
          id: collaboratorUser.id,
          username: collaboratorUser.username,
          email: collaboratorUser.email,
        },
      },
    });
  });
});