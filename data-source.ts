// dir: backend/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Luôn bật SSL cho Render
  
  // Trỏ đến các file .js trong dist
  entities: [__dirname + '/**/*.entity.js'],
  migrations: [__dirname + '/db/migrations/*.js'],

  migrationsTableName: 'migrations',
});