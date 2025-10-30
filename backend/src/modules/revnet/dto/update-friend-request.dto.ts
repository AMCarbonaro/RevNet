import { IsEnum } from 'class-validator';
import { FriendStatus } from '../entities/friend.entity';

export class UpdateFriendRequestDto {
  @IsEnum(FriendStatus)
  status: FriendStatus;
}
