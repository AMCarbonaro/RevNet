import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchMessagesQueryDto {
  @IsString()
  @Min(2)
  query: string;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasAttachments?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasEmbeds?: boolean;

  @IsOptional()
  @IsDateString()
  before?: string;

  @IsOptional()
  @IsDateString()
  after?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}
