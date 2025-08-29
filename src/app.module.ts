// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosModule } from './videos/videos.module';
import { Video } from './videos/entities/video.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'videos.sqlite',
      entities: [Video],
      synchronize: true, // Auto create tables (dev only)
    }),
    VideosModule,
  ],
})
export class AppModule {}
