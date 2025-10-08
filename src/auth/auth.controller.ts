// dir: ~/quangminh-smart-border/backend/src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @route POST /auth/register
   * @description Đăng ký tài khoản mới.
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Tạm thời, bất cứ ai cũng có thể đăng ký với vai trò mặc định (OPS)
    return this.authService.register(createUserDto);
  }

  /**
   * @route POST /auth/login
   * @description Đăng nhập và nhận JWT token.
   */
  @UseGuards(AuthGuard('local')) // Sử dụng LocalStrategy để xác thực
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // Body chỉ dùng để validation pipe hoạt động, req.user đã chứa user đã xác thực
    return this.authService.login(req.user);
  }

  /**
   * @route GET /auth/profile
   * @description Lấy thông tin profile của người dùng đã đăng nhập.
   */
  @UseGuards(AuthGuard('jwt')) // Sử dụng JwtStrategy để bảo vệ route này
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Trả về thông tin user đã được gắn vào request bởi JwtStrategy
  }
}