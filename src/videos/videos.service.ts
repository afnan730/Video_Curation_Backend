// src/videos/videos.service.ts
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private httpService: HttpService,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    const videoId = this.extractVideoId(createVideoDto.youtubeUrl);
    if (!videoId) {
      throw new BadRequestException('Invalid YouTube URL');
    }
    console.log(videoId);
    // Always save normalized format (videoId only or full consistent URL)
    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    createVideoDto.youtubeUrl = normalizedUrl;
    const ifExists = await this.videoRepository.findOne({
      where: { youtubeUrl: normalizedUrl },
    });
    if (ifExists) {
      throw new BadRequestException('Video already exists');
    }
    const video = this.videoRepository.create(createVideoDto);
    return this.videoRepository.save(video);
  }

  findAll(): Promise<Video[]> {
    return this.videoRepository.find();
  }

  async fetchYoutubeMetadata(youtubeUrl: string) {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new BadRequestException('Invalid YouTube URL');
    }
    console.log(videoId);
    const apiKey = process.env.YOUTUPE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    try {
      const response = await lastValueFrom(this.httpService.get(apiUrl));
      const items = response.data.items;
      if (!items || items.length === 0) {
        throw new NotFoundException('Video not found');
      }
      const snippet = items[0].snippet;
      return {
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.high?.url,
        youtubeUrl: youtubeUrl,
      };
    } catch (error) {
      if (error.response) {
        //Handle API errors from Youtube
        throw new HttpException(
          `Youtube API Error :${error.response.data.error.message}`,
          error.response.status,
        );
      }
      //Handle other errors
      throw new HttpException(
        'An error occured while fetching videoes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // private extractVideoId(url: string): string | null {
  //   const regex =
  //     /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  //   const match = url.match(regex);
  //   return match ? match[1] : null;
  // }
  private extractVideoId(url: string): string | null | undefined {
    try {
      const parsed = new URL(url);

      // watch?v=VIDEOID
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.searchParams.has('v')) {
          return parsed.searchParams.get('v');
        }

        // /embed/VIDEOID or /v/VIDEOID or /shorts/VIDEOID
        const parts = parsed.pathname.split('/');
        if (parts.length > 1) {
          return parts.pop();
        }
      }

      // youtu.be/VIDEOID
      if (parsed.hostname === 'youtu.be') {
        return parsed.pathname.slice(1);
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}
