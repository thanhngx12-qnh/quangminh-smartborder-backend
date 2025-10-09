// dir: ~/quangminh-smart-border/backend/src/careers/dto/create-job-application.dto.ts
import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateJobApplicationDto {
  @IsString()
  @IsNotEmpty()
  applicantName: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone: string;

  // `coverLetter` và `cvPath` sẽ được xử lý riêng
}