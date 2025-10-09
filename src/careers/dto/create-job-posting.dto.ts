// dir: ~/quangminh-smart-border/backend/src/careers/dto/create-job-posting.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { JobStatus } from '../entities/job-posting.entity';

export class CreateJobPostingDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;
  
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}