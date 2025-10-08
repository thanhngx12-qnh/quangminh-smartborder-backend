// dir: ~/quangminh-smart-border/backend/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service'; // Import service

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService], // Đăng ký UsersService
  exports: [TypeOrmModule, UsersService], // Export UsersService để AuthModule có thể dùng
})
export class UsersModule {}