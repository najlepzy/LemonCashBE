import { createTestCollaboratorsService } from "./collaborators.service.base.test";

describe('CollaboratorsService - listCollaborators', () => {
  let service: any;
  let prisma: any;

  beforeEach(() => {
    const setup = createTestCollaboratorsService();
    service = setup.service;
    prisma = setup.prisma;
  });

  it('should list collaborators mapped correctly', async () => {
    const fakeRelations = [
      {
        accepted: true,
        collaborator: {
          id: 2,
          username: 'collab',
          email: 'collab@example.com',
        },
      },
      {
        accepted: true,
        collaborator: {
          id: 3,
          username: 'collab2',
          email: 'collab2@example.com',
        },
      },
    ];
    (prisma.userCollaborator.findMany as jest.Mock).mockResolvedValue(
      fakeRelations,
    );

    const result = await service.listCollaborators(1);
    expect(prisma.userCollaborator.findMany).toHaveBeenCalledWith({
      where: { ownerId: 1, accepted: true },
      include: {
        collaborator: { select: { id: true, username: true, email: true } },
      },
    });
    expect(result).toEqual([
      {
        id: 2,
        username: 'collab',
        email: 'collab@example.com',
        accepted: true,
      },
      {
        id: 3,
        username: 'collab2',
        email: 'collab2@example.com',
        accepted: true,
      },
    ]);
  });
});