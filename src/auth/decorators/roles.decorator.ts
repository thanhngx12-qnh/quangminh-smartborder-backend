// dir: ~/quangminh-smart-border/backend/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

// Tạo một key duy nhất để lưu trữ và truy xuất metadata
export const ROLES_KEY = 'roles';
// Tạo decorator Roles(...) nhận vào một mảng các vai trò
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);