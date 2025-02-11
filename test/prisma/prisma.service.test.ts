import { PrismaService } from '@prisma/prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();

    prismaService.$connect = jest.fn();
    prismaService.$disconnect = jest.fn();
  });

  it('should call $connect on onModuleInit', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    await prismaService.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });
});