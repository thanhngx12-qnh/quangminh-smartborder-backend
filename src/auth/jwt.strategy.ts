// dir: ~/quangminh-smart-border/backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    // SỬA Ở ĐÂY: Kiểm tra và báo lỗi nếu thiếu JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Dùng biến 'secret' đã được kiểm tra
    });
  }

  /**
   * Phương thức này được tự động gọi sau khi Passport xác minh token thành công.
   * Payload là nội dung đã được giải mã từ JWT.
   * @param payload Payload đã giải mã từ JWT
   * @returns Đối tượng user sẽ được gán vào request (req.user)
   */
  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // Không trả về password trong payload trả về
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result; // Gán đối tượng user (không có password) vào request
  }
}