import { NotFoundException } from '@nestjs/common';
import { createTestCollaboratorsService } from './collaborators.service.base.test';

describe('CollaboratorsService - removeCollaborator', () => {
  let service: any;
  let prisma: any;
  let notificationsGateway: any;

  beforeEach(() => {
    const setup = createTestCollaboratorsService();
    service = setup.service;
    prisma = setup.prisma;
    notificationsGateway = setup.notificationsGateway;
  });

  it('should throw NotFoundException if relationship not found', async () => {
    (prisma.userCollaborator.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.removeCollaborator(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove collaborator successfully', async () => {
    (prisma.userCollaborator.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
    });
    (prisma.userCollaborator.delete as jest.Mock).mockResolvedValue({ id: 10 });
    const result = await service.removeCollaborator(1, 2);
    expect(prisma.userCollaborator.delete).toHaveBeenCalledWith({
      where: { ownerId_collaboratorId: { ownerId: 1, collaboratorId: 2 } },
    });
    expect(notificationsGateway.sendCollaborationRevoked).toHaveBeenCalledWith(
      2,
      {
        message: 'The owner has revoked your collaboration',
      },
    );
    expect(notificationsGateway.sendCollaboratorRemoved).toHaveBeenCalledWith(
      1,
      2,
    );
    expect(result).toEqual({ message: 'Collaborator removed successfully' });
  });
});