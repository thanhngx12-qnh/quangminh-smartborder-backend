// dir: ~/quangminh-smart-border/backend/src/users/users.service.ts
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt'; 

export type PaginatedUsersResult = PaginatedResult<User>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Tìm người dùng theo email.
   * @param email Email của người dùng.
   * @returns Người dùng tìm thấy hoặc null.
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  /**
   * Tìm người dùng theo email, bao gồm cả mật khẩu.
   * Dùng cho việc xác thực.
   * @param email Email của người dùng.
   * @returns Người dùng tìm thấy với mật khẩu hoặc null.
   */
  async findOneWithPassword(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // Yêu cầu rõ ràng để lấy cột password
      .getOne();
    return user ?? undefined;
  }

  /**
   * Tạo người dùng mới.
   * @param createUserDto Dữ liệu để tạo người dùng.
   * @returns Người dùng đã tạo (không có mật khẩu).
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    // Xóa mật khẩu khỏi đối tượng trả về để đảm bảo an toàn
    delete user.password;
    return user;
  }

  // --- CÁC HÀM MỚI CHO ADMIN CRUD ---

  async findAllForAdmin(queryDto: QueryUserDto): Promise<PaginatedUsersResult> {
    const { page, limit, q, sortBy, sortOrder, role } = queryDto;

    const allowedSortBy = ['id', 'email', 'fullName', 'role', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }
    const skip = (page - 1) * limit;

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
    const conditions: FindOptionsWhere<User>[] = [];

    if (q) {
      conditions.push({ email: ILike(`%${q}%`) });
      conditions.push({ fullName: ILike(`%${q}%`) });
      where = conditions;
    }
    
    if (role) {
      if(Array.isArray(where)) {
        where.forEach(condition => condition.role = role);
      } else {
        where.role = role;
      }
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    const lastPage = Math.ceil(total / limit);
    return { data, total, page, limit, lastPage };
  }

  async findOneForAdmin(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return user;
  }
  
  async createByAdmin(createDto: CreateUserByAdminDto): Promise<User> {
    const existing = await this.usersRepository.findOneBy({ email: createDto.email });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng.');
    }
    // Tạo mật khẩu ngẫu nhiên, an toàn
    const tempPassword = Math.random().toString(36).slice(-10);

    const newUser = this.usersRepository.create({
      ...createDto,
      password: tempPassword,
    });
    await this.usersRepository.save(newUser);
    delete newUser.password; // Không bao giờ trả về mật khẩu

    // TODO: Gửi email cho người dùng mới với mật khẩu tạm thời
    console.log(`Password for ${newUser.email} is: ${tempPassword}`);
    
    return newUser;
  }

  async updateByAdmin(id: number, updateDto: UpdateUserByAdminDto): Promise<User> {
    // Không cho phép hạ cấp/thay đổi vai trò của user ID=1 (super admin)
    if (id === 1 && updateDto.role && updateDto.role !== UserRole.ADMIN) {
        throw new BadRequestException('Không thể thay đổi vai trò của super admin.');
    }
      
    const user = await this.usersRepository.preload({ id, ...updateDto });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return this.usersRepository.save(user);
  }

  async removeForAdmin(id: number): Promise<void> {
    // Không cho phép xóa user ID=1 (super admin)
    if (id === 1) {
        throw new BadRequestException('Không thể xóa super admin.');
    }
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
  }

  async resetPasswordByAdmin(id: number, resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Không cho phép đổi mật khẩu của user ID=1 (super admin)
    if (id === 1) {
      throw new BadRequestException('Không thể đổi mật khẩu của super admin.');
    }
    
    const user = await this.findOneForAdmin(id); // Kiểm tra xem user có tồn tại không

    // Băm mật khẩu mới một cách thủ công
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Cập nhật mật khẩu đã băm cho người dùng
    await this.usersRepository.update(id, { password: hashedPassword });
    
    // TODO: Gửi email cho người dùng thông báo mật khẩu đã được reset
  }
}