// dir: ~/quangminh-smart-border/backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    // Log để xác nhận Strategy đã được khởi tạo khi ứng dụng bắt đầu
    console.log('✅ JwtStrategy has been initialized.');
  }

  /**
   * Phương thức này được Passport tự động gọi sau khi xác minh chữ ký và thời hạn của token thành công.
   * Nhiệm vụ của nó là nhận payload đã giải mã và trả về đối tượng user để gắn vào request.
   * @param payload - Nội dung đã được giải mã từ JWT (ví dụ: { sub: 1, email: '...' })
   * @returns Đối tượng user sẽ được gán vào request (req.user)
   */
  async validate(payload: { sub: number; email: string }): Promise<Omit<User, 'password'>> {
    // Log để biết hàm validate có được gọi mỗi khi có request được bảo vệ hay không
    console.log('--- JWT VALIDATE FUNCTION CALLED ---');
    console.log('Payload received from token:', payload);

    const user = await this.usersService.findOneByEmail(payload.email);
    
    if (!user) {
      console.error(`❌ User not found for email: ${payload.email}. Token is considered invalid.`);
      throw new UnauthorizedException('User not found or token is invalid.');
    }

    console.log(`✔️ User found in DB: ${user.email}, Role: ${user.role}`);
    
    // Xóa trường password khỏi đối tượng user trước khi trả về
    delete user.password;
    
    // Trả về đối tượng user, Passport sẽ tự động gán nó vào `request.user`
    return user;
  }
}