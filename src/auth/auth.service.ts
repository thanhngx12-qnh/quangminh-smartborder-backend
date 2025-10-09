// dir: ~/quangminh-smart-border/backend/src/auth/auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Đăng ký một người dùng mới.
   * @param createUserDto Dữ liệu người dùng mới.
   * @returns Người dùng đã tạo (không có mật khẩu).
   */
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }
    return this.usersService.create(createUserDto);
  }

  /**
   * Xác thực thông tin đăng nhập của người dùng.
   * @param email Email người dùng.
   * @param pass Mật khẩu người dùng.
   * @returns Thông tin người dùng nếu hợp lệ, nếu không trả về null.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneWithPassword(email);
    if (!user || !user.password) {
      return null;
    }

    if (await bcrypt.compare(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Tạo JWT access token khi đăng nhập thành công.
   * @param user Đối tượng người dùng đã được xác thực.
   * @returns Đối tượng chứa access_token.
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id }; // sub (subject) thường là user id
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}