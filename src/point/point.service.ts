import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { PointHistory, TransactionType, UserPoint } from './point.model';

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async point(userId: number): Promise<UserPoint> {
    return this.userDb.selectById(userId);
  }

  async history(userId: number): Promise<PointHistory[]> {
    return this.historyDb.selectAllByUserId(userId);
  }

  async charge(userId: number, amount: number): Promise<UserPoint> {
    const currentUserPoint = await this.userDb.selectById(userId);
    const [updatedUserPoint] = await Promise.all([
      this.userDb.insertOrUpdate(userId, currentUserPoint.point + amount),
      this.historyDb.insert(userId, amount, TransactionType.CHARGE, Date.now()),
    ]);
    return updatedUserPoint;
  }

  async use(userId: number, amount: number): Promise<UserPoint> {
    const currentUserPoint = await this.userDb.selectById(userId);

    if (currentUserPoint.point < amount) {
      throw new BadRequestException('Not enough point');
    }

    const [updatedUserPoint] = await Promise.all([
      this.userDb.insertOrUpdate(userId, currentUserPoint.point - amount),
      this.historyDb.insert(userId, amount, TransactionType.USE, Date.now()),
    ]);
    return updatedUserPoint;
  }
}
