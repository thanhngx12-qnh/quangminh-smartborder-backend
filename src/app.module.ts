// dir: ~/quangminh-smart-border/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ServicesModule } from './services/services.module';
import { ConsignmentsModule } from './consignments/consignments.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { CareersModule } from './careers/careers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // SỬA Ở ĐÂY: isGlobal thuộc về ConfigModule
    }),
    TypeOrmModule.forRootAsync({ // Chuyển sang forRootAsync
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        // Chúng ta sẽ sửa synchronize thành false ở bước 3
        synchronize: false, 
      }),
    }),
    // Cấu hình để phục vụ file tĩnh
    ServeStaticModule.forRoot({
      // process.cwd() trỏ đến thư mục gốc của dự án (/backend)
      // '/uploads' là thư mục chúng ta sẽ lưu file
      rootPath: join(process.cwd(), 'uploads'),
      // Khi truy cập URL /uploads, module này sẽ tìm file trong thư mục 'uploads'
      serveRoot: '/uploads',
    }),
    ServicesModule,
    ConsignmentsModule,
    QuotesModule,
    UsersModule,
    AuthModule,
    NewsModule,
    CareersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}