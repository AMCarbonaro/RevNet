import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  topic?: string;

  @IsOptional()
  @IsBoolean()
  nsfw?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsNumber()
  @Min(8000)
  @Max(128000)
  bitrate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99)
  userLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(21600)
  rateLimitPerUser?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}
