// dir: ~/quangminh-smart-border/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { ConsignmentsModule } from './consignments/consignments.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}