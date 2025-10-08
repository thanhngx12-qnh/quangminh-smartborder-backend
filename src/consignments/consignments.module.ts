// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Consignment } from './entities/consignment.entity'; // Import Consignment entity
import { TrackingEvent } from './entities/tracking-event.entity'; // Import TrackingEvent entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Consignment, TrackingEvent]), // Đăng ký các entity
  ],
  providers: [], // Sẽ thêm ConsignmentsService sau
  controllers: [], // Sẽ thêm ConsignmentsController sau
  exports: [TypeOrmModule], // Để các module khác có thể sử dụng các entity này nếu cần
})
export class ConsignmentsModule {}