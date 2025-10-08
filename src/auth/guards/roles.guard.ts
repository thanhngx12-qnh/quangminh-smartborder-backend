// dir: ~/quangminh-smart-border/backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { User } from 'src/users/entities/user.entity'; // Import User entity để lấy kiểu

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy các vai trò được yêu cầu từ metadata (được gán bởi @Roles decorator)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Kiểm tra metadata trên handler (phương thức)
      context.getClass(),   // Kiểm tra metadata trên controller (lớp)
    ]);

    // Nếu không có vai trò nào được yêu cầu, cho phép truy cập
    if (!requiredRoles) {
      return true;
    }

    // Lấy đối tượng user từ request (đã được JwtAuthGuard gán vào)
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // Nếu không có user hoặc user không có vai trò, từ chối truy cập
    if (!user || !user.role) {
      return false;
    }
    
    // Kiểm tra xem vai trò của user có nằm trong danh sách các vai trò được yêu cầu hay không
    return requiredRoles.some((role) => user.role === role);
  }
}