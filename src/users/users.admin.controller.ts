// dir: ~/quangminh-smart-border/backend/src/users/users.admin.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto'; 

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Chỉ ADMIN mới có quyền truy cập module này
@ApiBearerAuth()
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  findAllForAdmin(@Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: QueryUserDto) {
    return this.usersService.findAllForAdmin(queryDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo người dùng mới (bởi Admin)' })
  createByAdmin(@Body() createUserDto: CreateUserByAdminDto) {
    return this.usersService.createByAdmin(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một người dùng' })
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng (bởi Admin)' })
  updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserByAdminDto,
  ) {
    return this.usersService.updateByAdmin(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một người dùng (bởi Admin)' })
  removeForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeForAdmin(id);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cấp lại mật khẩu mới cho người dùng (bởi Admin)' })
  resetPasswordByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.usersService.resetPasswordByAdmin(id, resetPasswordDto);
  }
}