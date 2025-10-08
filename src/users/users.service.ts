// dir: ~/quangminh-smart-border/backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // Sẽ tạo DTO này sau

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
}