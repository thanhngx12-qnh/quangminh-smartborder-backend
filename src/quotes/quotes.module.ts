// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { Service } from 'src/services/entities/service.entity'; // <-- Import
import { QuotesAdminController } from './quotes.admin.controller'; 

@Module({
  imports: [
    // Cung cấp Repository cho Quote và Service
    TypeOrmModule.forFeature([Quote, Service]), 
  ],
  providers: [QuotesService],
  controllers: [QuotesController],
  exports: [QuotesService], // Đổi từ TypeOrmModule sang QuotesService
})
export class QuotesModule {}