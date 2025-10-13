// dir: ~/quangminh-smart-border/backend/src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Cấu hình để passport-local sử dụng trường 'email' thay vì 'username' mặc định
    super({ usernameField: 'email' });
    console.log('✅ LocalStrategy has been initialized.');
  }

  /**
   * Phương thức này được Passport tự động gọi khi endpoint được bảo vệ bởi AuthGuard('local').
   * Nhiệm vụ của nó là nhận email và password từ request body và xác thực chúng.
   * @param email - Email từ request body
   * @param password - Mật khẩu từ request body
   * @returns Đối tượng user nếu xác thực thành công, nếu không sẽ ném ra lỗi.
   */
  async validate(email: string, password: string): Promise<any> {
    console.log(`--- LOCAL VALIDATE FUNCTION CALLED for email: ${email} ---`);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.error(`❌ Invalid credentials for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(`✔️ User validated successfully: ${email}`);
    return user;
  }
}