// dir: ~/quangminh-smart-border/backend/src/services/services.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller'; // Đã được thêm tự động

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceTranslation]),
  ],
  controllers: [ServicesController], // Đã được thêm tự động
  providers: [ServicesService],
  exports: [TypeOrmModule, ServicesService],
})
export class ServicesModule {}