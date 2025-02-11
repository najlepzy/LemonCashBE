import { AuthService } from '@modules/auth/auth.service';
import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService Unit Tests', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      incrementTokenVersion: jest.fn().mockResolvedValue({ tokenVersion: 1 }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    authService = new AuthService(
      usersService as UsersService,
      jwtService as JwtService,
    );
  });

  describe('register', () => {
    it('should throw ConflictException if the email already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });
      await expect(
        authService.register({
          username: 'test',
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if the username already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.findByUsername as jest.Mock).mockResolvedValue({ id: 1 });
      await expect(
        authService.register({
          username: 'test',
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(ConflictException);
    });

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

      const result = await authService.register({
        username: 'test',
        email: 'test@example.com',
        password: 'Password1!',
      });
      expect(result.user).toEqual({
        id: 1,
        username: 'test',
        email: 'test@example.com',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if the user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password does not match', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

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

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password1!',
      });
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token', 'signed-token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('logout', () => {
    it('should throw UnauthorizedException if the user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.logout({
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password does not match', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      await expect(
        authService.logout({
          email: 'test@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

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
      const result = await authService.logout({
        email: 'test@example.com',
        password: 'Password1!',
      });
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});