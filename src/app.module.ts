// dir: ~/quangminh-smart-border/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { ConsignmentsModule } from './consignments/consignments.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // SỬA Ở ĐÂY: isGlobal thuộc về ConfigModule
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'quangminh',
      password: 'password',
      database: 'quangminh_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServicesModule,
    ConsignmentsModule,
    QuotesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}