// dir: ~/quangminh-smart-border/backend/src/services/services.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { ServicesService } from './services.service'; // Đã được thêm tự động
import { ServicesController } from './services.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceTranslation]),
  ],
  providers: [ServicesService], // Đã được thêm tự động
  controllers: [ServicesController], // Sẽ thêm ServiceController sau
  exports: [TypeOrmModule, ServicesService], // Export ServicesService để các module khác có thể sử dụng
})
export class ServicesModule {}