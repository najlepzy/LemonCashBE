import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '@prisma/prisma.module';
import { PrismaService } from '@prisma/prisma.service';

describe('PrismaModule', () => {
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    prismaService.$connect = jest.fn().mockResolvedValue(undefined);
    prismaService.$disconnect = jest.fn().mockResolvedValue(undefined);
  });

  it('should provide PrismaService', () => {
    expect(prismaService).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });
});