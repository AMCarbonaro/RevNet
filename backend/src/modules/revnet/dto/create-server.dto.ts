import { IsString, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength, IsArray } from 'class-validator';
import { ServerType } from '../entities/server.entity';

export class CreateServerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsEnum(ServerType)
  type?: ServerType;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isDiscoverable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shortDescription?: string;
}
