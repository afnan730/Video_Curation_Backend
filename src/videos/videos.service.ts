// src/videos/videos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private httpService: HttpService
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    const video = this.videoRepository.create(createVideoDto);
    return this.videoRepository.save(video);
  }

  findAll(): Promise<Video[]> {
    return this.videoRepository.find();
  }

  async fetchYoutubeMetadata(youtubeUrl: string) {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${youtubeUrl}&format=json`;

    try {
      const response = await firstValueFrom(this.httpService.get(oEmbedUrl));
      const { title, author_name, thumbnail_url } = response.data;
      return {
        title,
        description: `Video by ${author_name}`,
        youtubeUrl,
        thumbnailUrl: thumbnail_url,
      };
    } catch (error) {
      return {
        title: 'Unknown Title',
        description: 'No description available',
        youtubeUrl,
        thumbnailUrl: null,
      };
    }
  }
}
