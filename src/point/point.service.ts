import { Injectable } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { PointHistory, UserPoint } from './point.model';

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async point(userId: number): Promise<UserPoint> {
    // return this.userDb.selectById(userId);
    return { id: userId, point: 0, updateMillis: Date.now() };
  }

  async history(userId: number): Promise<PointHistory[]> {
    // return this.historyDb.selectAllByUserId(userId);
    console.log(userId);
    return [];
  }

  async charge(userId: number, amount: number): Promise<UserPoint> {
    // return this.userDb.insertOrUpdate(userId, amount);
    return { id: userId, point: amount, updateMillis: Date.now() };
  }

  async use(userId: number, amount: number): Promise<UserPoint> {
    // return this.userDb.insertOrUpdate(userId, amount);
    return { id: userId, point: amount, updateMillis: Date.now() };
  }
}
