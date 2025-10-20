// dir: ~/quangminh-smart-border/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Import tất cả các feature modules
import { ServicesModule } from './services/services.module';
import { ConsignmentsModule } from './consignments/consignments.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { CareersModule } from './careers/careers.module'; 
import { SearchModule } from './search/search.module';
import { DataSource } from 'typeorm'; 
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // QUAN TRỌNG: Cung cấp `dataSourceFactory` để Nest có thể inject DataSource
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: configService.get<string>('NODE_ENV') === 'production' 
             ? { rejectUnauthorized: false } 
             : false,
        entities: [join(__dirname, '**', '*.entity.{js,ts}')],
        // THÊM CẤU HÌNH MIGRATIONS Ở ĐÂY
        migrations: [join(__dirname, 'db', 'migrations', '*.{js,ts}')],
        migrationsTableName: 'migrations',
        // Bật tùy chọn này để migration có thể chạy
        migrationsRun: false, // Để false, chúng ta sẽ chạy thủ công trong main.ts
      }),
      // Hàm này rất quan trọng
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        return dataSource;
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // Đăng ký tất cả các module chức năng
    ServicesModule,
    ConsignmentsModule,
    QuotesModule,
    UsersModule,
    AuthModule,
    NewsModule,
    CareersModule,
    SearchModule,
    CloudinaryModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}