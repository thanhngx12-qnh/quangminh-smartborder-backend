// dir: ~/quangminh-smart-border/backend/src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert, // Import hook BeforeInsert
} from 'typeorm';
import * as bcrypt from 'bcrypt'; // Import bcrypt

export enum UserRole {
  ADMIN = 'ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  SALES = 'SALES',
  OPS = 'OPS',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  @Index({ unique: true })
  email: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ length: 255, select: false }) // Thêm select: false để mật khẩu không được trả về trong các truy vấn thông thường
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPS,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Hook này sẽ chạy trước khi một bản ghi User mới được lưu vào database
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10); // Băm mật khẩu với salt 10 vòng
    }
  }
}