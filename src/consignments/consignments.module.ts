// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consignment } from './entities/consignment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { ConsignmentsService } from './consignments.service';
import { AiEtaService } from './ai-eta.service';
import { ConsignmentsController } from './consignments.controller'; // Import controller
import { ConsignmentsAdminController } from './consignments.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consignment, TrackingEvent]),
  ],
  providers: [ConsignmentsService, AiEtaService],
  controllers: [ConsignmentsController, ConsignmentsAdminController], // Đăng ký controller
  exports: [TypeOrmModule, ConsignmentsService],
})
export class ConsignmentsModule {}  