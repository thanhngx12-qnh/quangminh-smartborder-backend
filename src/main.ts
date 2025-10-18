// dir: ~/quangminh-smart-border/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS để cho phép frontend truy cập API (quan trọng cho phát triển)
  app.enableCors({
    origin: '*', // Cho phép mọi domain, trong production nên giới hạn cụ thể
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor()); 

  // Kích hoạt Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không được whitelisted
    transform: true, // Tự động chuyển đổi payload thành instance của DTO
    transformOptions: {
      enableImplicitConversion: true, // Cho phép chuyển đổi kiểu dữ liệu ngầm định (ví dụ: 'true' -> true)
    },
  }));

  // --- Cấu hình Swagger ---
  const config = new DocumentBuilder()
    .setTitle('Phú Anh Smart Border API') // Tiêu đề của API
    .setDescription(
      'The official API documentation for Phú Anh Smart Border Logistics Platform.', // Mô tả
    )
    .setVersion('1.0') // Phiên bản
    .addTag('Services', 'APIs related to logistics services management') // Thêm các Tag để gom nhóm API
    .addTag('Auth', 'Authentication and user management')
    .addTag('Consignments', 'APIs for tracking consignments (shipments)')
    .addTag('Quotes', 'APIs for handling customer quotations')
    .addTag('News', 'APIs for news and policy management')
    .addTag('Careers', 'APIs for job postings and applications')
    .addBearerAuth() // <-- Thêm mục nhập cho JWT Bearer Token
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  // URL để truy cập Swagger UI là '/api-docs'
  SwaggerModule.setup('api-docs', app, document);
  // --- Kết thúc Cấu hình Swagger ---

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();