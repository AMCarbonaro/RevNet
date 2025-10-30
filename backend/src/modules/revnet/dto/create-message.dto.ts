import { IsString, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsBoolean()
  tts?: boolean;

  @IsOptional()
  @IsBoolean()
  mentionEveryone?: boolean;

  @IsOptional()
  @IsString()
  nonce?: string;

  @IsOptional()
  @IsString()
  referencedMessageId?: string;
}
