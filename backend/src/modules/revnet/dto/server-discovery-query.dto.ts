import { IsOptional, IsString, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ServerSortBy {
  POPULAR = 'popular',
  RECENT = 'recent',
  ACTIVE = 'active'
}

export class ServerDiscoveryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value].filter(Boolean))
  tags?: string[];

  @IsOptional()
  @IsEnum(ServerSortBy)
  sortBy?: ServerSortBy = ServerSortBy.POPULAR;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}
