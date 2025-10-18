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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('DB_HOST'),
    //     port: configService.get<number>('DB_PORT'),
    //     username: configService.get<string>('DB_USERNAME'),
    //     password: configService.get<string>('DB_PASSWORD'),
    //     database: configService.get<string>('DB_DATABASE'),
    //     autoLoadEntities: true,
    //     synchronize: false, 
    //   }),
    // }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // SỬA Ở ĐÂY:
        // Nếu có DATABASE_URL (trên Render), dùng nó.
        // Nếu không, dùng các biến DB_* cho local.
        url: configService.get<string>('DATABASE_URL'),
        // Thêm SSL cho Render, không cần cho local
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false, // Luôn là false cho production
      }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}