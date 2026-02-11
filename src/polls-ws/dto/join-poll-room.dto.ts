import { IsNumber } from 'class-validator';

export class JoinPollRoomDto {
  @IsNumber()
  pollId: number;
}
