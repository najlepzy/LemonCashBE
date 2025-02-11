import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs/src/lib/zod-validation-pipe';
import { CreateUserDto } from '@modules/users/dto/createUserDto';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ZodValidationPipe()) createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return await this.authService.login(loginDto);
  }

  @Post('logout')
  async logout(@Body() credentials: { email: string; password: string }) {
    return await this.authService.logout(credentials);
  }
}
