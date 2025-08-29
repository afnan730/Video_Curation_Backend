// src/videos/dto/create-video.dto.ts
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  youtubeUrl: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
