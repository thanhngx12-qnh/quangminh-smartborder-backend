// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller'; // Import controller

@Module({
  imports: [
    TypeOrmModule.forFeature([Quote]),
  ],
  providers: [QuotesService],
  controllers: [QuotesController], // Đăng ký controller
  exports: [TypeOrmModule, QuotesService],
})
export class QuotesModule {}