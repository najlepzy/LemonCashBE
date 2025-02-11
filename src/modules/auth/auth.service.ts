import { CreateUserDto } from '@modules/users/dto/createUserDto';
import { UsersService } from '@modules/users/users.service';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingEmail = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already registered');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const { password, ...safeUserData } = user;
    return { user: safeUserData };
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Incrementamos tokenVersion para invalidar tokens anteriores
    const updatedUser = await this.usersService.incrementTokenVersion(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      tokenVersion: updatedUser.tokenVersion,
      createdAt: new Date().toISOString(), // Se incluye la fecha de creación
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  async logout({ email, password }: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.usersService.incrementTokenVersion(user.id);
    return { message: 'Logout successful' };
  }
}
