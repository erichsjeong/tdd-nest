import { IsInt } from 'class-validator';

export class PointDto {
  @IsInt()
  amount: number;
}
