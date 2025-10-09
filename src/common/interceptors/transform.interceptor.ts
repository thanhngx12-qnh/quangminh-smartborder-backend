// dir: ~/quangminh-smart-border/backend/src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Định nghĩa một interface cho cấu trúc response nhất quán của chúng ta
export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    
    // next.handle() trả về một Observable, chúng ta sử dụng .pipe() để thao tác với luồng dữ liệu
    return next.handle().pipe(
      map(data => ({
        statusCode: response.statusCode, // Lấy mã trạng thái HTTP từ đối tượng response gốc
        message: 'Success', // Thông điệp thành công mặc định
        data: data, // Gói dữ liệu gốc vào thuộc tính 'data'
      })),
    );
  }
}