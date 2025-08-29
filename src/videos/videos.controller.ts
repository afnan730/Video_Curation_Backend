// src/videos/videos.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { FetchMetadataDto } from './dto/fetch-metadata.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('fetch-metadata')
  fetchMetadata(@Body() fetchMetadataDto: FetchMetadataDto) {
    return this.videosService.fetchYoutubeMetadata(fetchMetadataDto.youtubeUrl);
  }

  @Post()
  create(@Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }
}
