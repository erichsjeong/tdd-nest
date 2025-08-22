import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { Test, TestingModule } from '@nestjs/testing';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { BadRequestException } from '@nestjs/common';

describe('PointService', () => {
  let pointService: PointService;
  let userPointTable: jest.Mocked<UserPointTable>;
  let pointHistoryTable: jest.Mocked<PointHistoryTable>;

  beforeEach(async () => {
    const mockUserPointTable = {
      selectById: jest.fn(),
      insertOrUpdate: jest.fn(),
    };

    const mockPointHistoryTable = {
      insert: jest.fn(),
      selectAllByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        { provide: UserPointTable, useValue: mockUserPointTable },
        { provide: PointHistoryTable, useValue: mockPointHistoryTable },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    userPointTable = module.get(UserPointTable);
    pointHistoryTable = module.get(PointHistoryTable);
  });

  // 포인트 조회
  describe('get user point', () => {
    it('should return point', async () => {
      // Given
      const userId = 1;
      const expectedUserPoint: UserPoint = {
        id: userId,
        point: 100,
        updateMillis: Date.now(),
      };
      userPointTable.selectById.mockResolvedValue(expectedUserPoint);

      // When
      const result = await pointService.point(userId);

      // Then
      expect(result).toEqual(expectedUserPoint);
    });
  });

  // 포인트 충전/사용 내역 조회
  describe('get point history', () => {
    it('should return history', async () => {
      // Given
      const userId = 1;
      const expectedPointHistory: PointHistory[] = [
        {
          id: 1,
          userId,
          amount: 100,
          type: TransactionType.CHARGE,
          timeMillis: Date.now(),
        },
      ];
      pointHistoryTable.selectAllByUserId.mockResolvedValue(
        expectedPointHistory,
      );

      // When
      const result = await pointService.history(userId);

      // Then
      expect(result).toEqual(expectedPointHistory);
    });
  });

  // 포인트 충전 시 정상적으로 유저의 포인트가 증가하는지 확인
  describe('charge point', () => {
    it('should return point', async () => {
      // Given
      const userId = 1;
      const currentPoint = 500;
      const chargeAmount = 1000;

      const currentUserPoint: UserPoint = {
        id: userId,
        point: currentPoint,
        updateMillis: Date.now(),
      };

      const expectedUserPoint: UserPoint = {
        id: userId,
        point: currentPoint + chargeAmount,
        updateMillis: expect.any(Number),
      };
      userPointTable.selectById.mockResolvedValue(currentUserPoint);
      userPointTable.insertOrUpdate.mockResolvedValue(expectedUserPoint);

      // When
      const result = await pointService.charge(userId, chargeAmount);

      // Then
      expect(result).toEqual(expectedUserPoint);
    });
  });

  // 포인트 사용 시 정상적으로 유저의 포인트가 감소하는지 확인
  describe('use point', () => {
    it('should return point', async () => {
      // Given
      const userId = 1;
      const currentPoint = 1000;
      const useAmount = 500;

      const currentUserPoint: UserPoint = {
        id: userId,
        point: currentPoint,
        updateMillis: Date.now(),
      };

      const expectedUserPoint: UserPoint = {
        id: userId,
        point: currentPoint - useAmount,
        updateMillis: expect.any(Number),
      };
      userPointTable.selectById.mockResolvedValue(currentUserPoint);
      userPointTable.insertOrUpdate.mockResolvedValue(expectedUserPoint);

      // When
      const result = await pointService.use(userId, useAmount);

      // Then
      expect(result).toEqual(expectedUserPoint);
    });
  });

  // 포인트 사용 시 포인트가 부족하면 예외 발생
  describe('use point with not enough point', () => {
    it('should throw error', async () => {
      // Given
      const userId = 1;
      const currentPoint = 500;
      const useAmount = 1000;

      const currentUserPoint: UserPoint = {
        id: userId,
        point: currentPoint,
        updateMillis: Date.now(),
      };
      userPointTable.selectById.mockResolvedValue(currentUserPoint);
      userPointTable.insertOrUpdate.mockResolvedValue(currentUserPoint);

      // Then
      await expect(pointService.use(userId, useAmount)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
