import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Một Guard để kích hoạt chiến lược xác thực JWT ('jwt') của Passport.
 * Nó sẽ tự động xác minh token, giải mã payload, và gán đối tượng user
 * vào request nếu token hợp lệ.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}