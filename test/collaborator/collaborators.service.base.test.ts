import { CollaboratorsService } from '@modules/collaborators/collaborators.service';
import { PrismaService } from '@prisma/prisma.service';
import { UsersService } from '@modules/users/users.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

export const createTestCollaboratorsService = () => {
  const prisma = {
    userCollaborator: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const usersService = {
    findByIdentifier: jest.fn(),
  } as unknown as UsersService;

  const notificationsGateway = {
    sendCollaboratorInvite: jest.fn(),
    sendCollaborationRevoked: jest.fn(),
    sendCollaboratorRemoved: jest.fn(),
    server: { emit: jest.fn() } as unknown as NotificationsGateway['server'],
  } as unknown as NotificationsGateway;

  const service = new CollaboratorsService(
    prisma,
    usersService,
    notificationsGateway,
  );

  return { service, prisma, usersService, notificationsGateway };
};

describe('Helper - createTestCollaboratorsService', () => {
  it('should create a test service instance', () => {
    const { service } = createTestCollaboratorsService();
    expect(service).toBeDefined();
  });
});