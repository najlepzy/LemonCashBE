import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';

@Controller('test-auth')
export class TestAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return await this.authService.login(body);
  }

  @Post('logout')
  async logout(@Body() body: any) {
    return await this.authService.logout(body);
  }
}