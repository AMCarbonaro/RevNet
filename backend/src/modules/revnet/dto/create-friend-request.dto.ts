import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  friendUsername: string;
}
