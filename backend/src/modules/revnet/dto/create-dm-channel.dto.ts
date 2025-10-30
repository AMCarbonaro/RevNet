import { IsString, IsArray, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateDMChannelDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;
}

export class CreateGroupDMChannelDto {
  @IsArray()
  @IsString({ each: true })
  recipientIds: string[];

  @IsString()
  @IsOptional()
  name?: string;
}
