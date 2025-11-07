// // dir: ~/quangminh-smart-border/backend/data-source.ts
// import { DataSource } from 'typeorm';
// import { config } from 'dotenv';
// import { join } from 'path'; 

// config();

// const isProduction = process.env.NODE_ENV === 'production';

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   // host: process.env.DB_HOST || 'localhost',
//   // port: parseInt(process.env.DB_PORT || '5432', 10),
//   // username: process.env.DB_USERNAME || 'quangminh',
//   // password: process.env.DB_PASSWORD || 'password',
//   // database: process.env.DB_DATABASE || 'quangminh_db',
//   url: process.env.DATABASE_URL,
//   ssl: isProduction ? { rejectUnauthorized: false } : false,
  
//   // SỬA LẠI ĐÂY
//   // Nếu là production, load file .js từ thư mục dist.
//   // Nếu không, load file .ts từ thư mục src.
//   entities: [join(__dirname, '**', '*.entity.js')],
//   migrations: [join(__dirname, 'db', 'migrations', '*.js')],

//   migrationsTableName: 'migrations',
//   synchronize: false,
// });

// dir: ~/quangminh-smart-border/backend/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,

  // 💡 Ép Node.js chỉ dùng IPv4 để tránh lỗi ENETUNREACH trên Render
  extra: {
    family: 4,
  },

  // Nếu là production → load file .js từ dist
  // Nếu là development → load file .ts từ src
  entities: [join(__dirname, '**', '*.entity.js')],
  migrations: [join(__dirname, 'db', 'migrations', '*.js')],
  migrationsTableName: 'migrations',

  synchronize: false,
});
