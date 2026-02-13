import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto ){
    const newUserRegister = await this.authService.register(registerDto);
    return newUserRegister;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto ){
    return this.authService.login(loginDto);
  }
}
