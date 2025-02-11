import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '@modules/auth/auth.service';
import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TestAuthController } from '../helpers/test-auth.controller';

describe('AuthService Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      incrementTokenVersion: jest.fn().mockResolvedValue({ tokenVersion: 1 }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TestAuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /test-auth/register', () => {
    it('should register the user if the data is valid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementation(() => Promise.resolve('salt'));
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      const payload = {
        username: 'test',
        email: 'test@example.com',
        password: 'Password1!',
      };

      const response = await request(app.getHttpServer())
        .post('/test-auth/register')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        user: { id: 1, username: 'test', email: 'test@example.com' },
      });
    });
  });

  describe('POST /test-auth/login', () => {
    it('should log in the user if the data is valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        password: 'hashed',
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      (usersService.incrementTokenVersion as jest.Mock).mockResolvedValue({
        tokenVersion: 2,
      });

      const payload = {
        email: 'test@example.com',
        password: 'Password1!',
      };

      const response = await request(app.getHttpServer())
        .post('/test-auth/login')
        .send(payload)
        .expect(201);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(response.body).toHaveProperty('token', 'signed-token');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('POST /test-auth/logout', () => {
    it('should log out if the data is valid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      (usersService.incrementTokenVersion as jest.Mock).mockResolvedValue({
        tokenVersion: 2,
      });

      const payload = {
        email: 'test@example.com',
        password: 'Password1!',
      };

      const response = await request(app.getHttpServer())
        .post('/test-auth/logout')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({ message: 'Logout successful' });
    });
  });
});