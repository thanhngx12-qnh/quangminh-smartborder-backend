// dir: ~/quangminh-smart-border/backend/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersAdminController } from './users.admin.controller'; // <-- Import controller mới

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  // Thêm controller mới vào đây
  controllers: [UsersAdminController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}