// dir: ~/quangminh-smart-border/backend/src/common/types/pagination.types.ts
// (Chúng ta sẽ đặt nó vào thư mục 'common' để có thể tái sử dụng)

export interface PaginatedResult<T> {
  data: T[];       // Mảng chứa dữ liệu của trang hiện tại
  total: number;     // Tổng số lượng bản ghi
  page: number;      // Trang hiện tại
  limit: number;     // Số lượng bản ghi trên mỗi trang
  lastPage: number;  // Trang cuối cùng
}