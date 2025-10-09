// dir: ~/quangminh-smart-border/backend/src/news/dto/update-news.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}