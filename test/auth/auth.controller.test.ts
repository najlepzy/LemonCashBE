import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { CreateUserDto } from '@modules/users/dto/createUserDto';

describe('AuthController Unit Tests', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(() => {
    authService = {
      register: jest.fn().mockResolvedValue({
        user: { id: 1, username: 'test', email: 'test@example.com' },
      }),
      login: jest.fn().mockResolvedValue({
        token: 'signed-token',
        user: { id: 1, username: 'test', email: 'test@example.com' },
      }),
      logout: jest.fn().mockResolvedValue({ message: 'Logout successful' }),
    };

    authController = new AuthController(authService as AuthService);
  });

  describe('register', () => {
    it('should call authService.register and return its result', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'Password1!',
      };
      const result = await authController.register(createUserDto);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        user: { id: 1, username: 'test', email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password1!' };
      const result = await authController.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        token: 'signed-token',
        user: { id: 1, username: 'test', email: 'test@example.com' },
      });
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return its result', async () => {
      const credentials = { email: 'test@example.com', password: 'Password1!' };
      const result = await authController.logout(credentials);
      expect(authService.logout).toHaveBeenCalledWith(credentials);
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});

describe('AuthController Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({
              user: { id: 1, username: 'test', email: 'test@example.com' },
            }),
            login: jest.fn().mockResolvedValue({
              token: 'signed-token',
              user: { id: 1, username: 'test', email: 'test@example.com' },
            }),
            logout: jest
              .fn()
              .mockResolvedValue({ message: 'Logout successful' }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should register a user', async () => {
    const createUserDto = {
      username: 'test',
      email: 'test@example.com',
      password: 'Password1!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(createUserDto)
      .expect(201);

    expect(authService.register).toHaveBeenCalledWith(createUserDto);
    expect(response.body).toEqual({
      user: { id: 1, username: 'test', email: 'test@example.com' },
    });
  });

  it('POST /auth/login should login a user', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password1!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(response.body).toEqual({
      token: 'signed-token',
      user: { id: 1, username: 'test', email: 'test@example.com' },
    });
  });

  it('POST /auth/logout should logout a user', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'Password1!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .send(credentials)
      .expect(201);

    expect(authService.logout).toHaveBeenCalledWith(credentials);
    expect(response.body).toEqual({ message: 'Logout successful' });
  });
});