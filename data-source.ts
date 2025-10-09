// dir: ~/quangminh-smart-border/backend/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'quangminh',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'quangminh_db',
  
  entities: ['src/**/*.entity.ts'], // Đã đúng, giữ nguyên
  migrations: ['src/db/migrations/*.ts'], // Đã đúng, giữ nguyên

  migrationsTableName: 'migrations',
  synchronize: false,
});