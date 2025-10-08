// dir: ~/quangminh-smart-border/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS để cho phép frontend truy cập API (quan trọng cho phát triển)
  app.enableCors({
    origin: '*', // Cho phép mọi domain, trong production nên giới hạn cụ thể
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Kích hoạt Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không được whitelisted
    transform: true, // Tự động chuyển đổi payload thành instance của DTO
    transformOptions: {
      enableImplicitConversion: true, // Cho phép chuyển đổi kiểu dữ liệu ngầm định (ví dụ: 'true' -> true)
    },
  }));

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();