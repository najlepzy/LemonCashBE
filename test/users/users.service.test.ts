import { UsersService } from '@modules/users/users.service';
import { PrismaService } from '@prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      onModuleInit: jest.fn().mockResolvedValue(undefined),
      onModuleDestroy: jest.fn().mockResolvedValue(undefined),
    } as unknown as PrismaService;

    service = new UsersService(prisma);
  });

  it('should create a user', async () => {
    const createUserDto = {
      username: 'test',
      email: 'test@example.com',
      password: 'password',
    };
    const createdUser = { id: 1, ...createUserDto };
    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);
    const result = await service.create(createUserDto);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
    expect(result).toEqual(createdUser);
  });

  it('should find a user by email', async () => {
    const email = 'test@example.com';
    const user = { id: 1, email };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    const result = await service.findByEmail(email);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    expect(result).toEqual(user);
  });

  it('should find a user by identifier', async () => {
    const identifier = 'test';
    const user = { id: 1, username: 'test', email: 'test@example.com' };
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
    const result = await service.findByIdentifier(identifier);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });
    expect(result).toEqual(user);
  });

  it('should find a user by username', async () => {
    const username = 'test';
    const user = { id: 1, username, email: 'test@example.com' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    const result = await service.findByUsername(username);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username },
    });
    expect(result).toEqual(user);
  });

  it('should find a user by id', async () => {
    const id = 1;
    const user = { id, username: 'test', email: 'test@example.com' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    const result = await service.findById(id);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual(user);
  });

  it('should increment token version', async () => {
    const userId = 1;
    const updatedUser = { id: userId, tokenVersion: 2 };
    (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);
    const result = await service.incrementTokenVersion(userId);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    expect(result).toEqual(updatedUser);
  });
});
