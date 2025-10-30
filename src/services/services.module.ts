// dir: ~/quangminh-smart-border/backend/src/services/services.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesAdminController } from './services.admin.controller'; // <-- Import

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceTranslation]),
  ],
  controllers: [
    ServicesController,         // Giữ lại controller cũ cho trang public
    ServicesAdminController,    // Thêm controller mới cho admin
  ],
  providers: [ServicesService],
  exports: [ServicesService],     // Đổi từ [TypeOrmModule, ServicesService]
})
export class ServicesModule {}