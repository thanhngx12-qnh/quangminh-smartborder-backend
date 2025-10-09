// dir: ~/quangminh-smart-border/backend/src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // <-- Import

@ApiTags('Auth') // <-- Gom nhóm tất cả API trong controller này vào tag 'Auth'
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Mô tả ngắn gọn API làm gì
  @ApiResponse({ status: 201, description: 'User successfully registered.' }) // Mô tả response thành công
  @ApiResponse({ status: 409, description: 'Email already exists.' }) // Mô tả response lỗi
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Log in and receive a JWT' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token.'})
  @ApiResponse({ status: 401, description: 'Invalid credentials.'})
  async login(@Request() req, @Body() loginDto: LoginDto) { // @Body được thêm vào để Swagger nhận diện
    return this.authService.login(req.user);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // <-- Đánh dấu rằng API này yêu cầu Bearer Token
  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the currently logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns user profile data.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  getProfile(@Request() req) {
    return req.user;
  }
}