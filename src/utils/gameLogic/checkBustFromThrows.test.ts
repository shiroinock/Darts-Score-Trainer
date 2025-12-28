import { describe, expect, it } from 'vitest';
import type { ThrowResult } from '../../types';
import { checkBustFromThrows } from './checkBustFromThrows';

describe('checkBustFromThrows', () => {
  describe('バストなしのケース', () => {
    it('バストが発生しない場合はundefinedを返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 100);
      expect(result).toBeUndefined();
    });

    it('残り点数ちょうどでダブルアウトの場合はundefinedを返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'DOUBLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 40,
          ring: 'DOUBLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 40);
      expect(result).toBeUndefined();
    });

    it('INNER_BULLでフィニッシュした場合はundefinedを返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'BULL', number: null },
          landingPoint: { x: 0, y: 0 },
          score: 50,
          ring: 'INNER_BULL',
        },
      ];
      const result = checkBustFromThrows(throws, 50);
      expect(result).toBeUndefined();
    });
  });

  describe('オーバー（over）のケース', () => {
    it('1投目でオーバーした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 50);
      expect(result).toEqual({
        isBust: true,
        reason: 'over',
      });
    });

    it('2投目でオーバーした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 70);
      expect(result).toEqual({
        isBust: true,
        reason: 'over',
      });
    });

    it('3投目でオーバーした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 90);
      expect(result).toEqual({
        isBust: true,
        reason: 'over',
      });
    });
  });

  describe('1点残し（finish_impossible）のケース', () => {
    it('1投目で1点残しになった場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'DOUBLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 40,
          ring: 'DOUBLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 41);
      expect(result).toEqual({
        isBust: true,
        reason: 'finish_impossible',
      });
    });

    it('2投目で1点残しになった場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'DOUBLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 40,
          ring: 'DOUBLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 61);
      expect(result).toEqual({
        isBust: true,
        reason: 'finish_impossible',
      });
    });
  });

  describe('ダブルアウト失敗（double_out_required）のケース', () => {
    it('シングルで0点にした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 20,
          ring: 'INNER_SINGLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 20);
      expect(result).toEqual({
        isBust: true,
        reason: 'double_out_required',
      });
    });

    it('トリプルで0点にした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 60);
      expect(result).toEqual({
        isBust: true,
        reason: 'double_out_required',
      });
    });

    it('OUTER_BULLで0点にした場合にバスト情報を返す', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'BULL', number: null },
          landingPoint: { x: 0, y: 0 },
          score: 25,
          ring: 'OUTER_BULL',
        },
      ];
      const result = checkBustFromThrows(throws, 25);
      expect(result).toEqual({
        isBust: true,
        reason: 'double_out_required',
      });
    });
  });

  describe('複数投擲の組み合わせ', () => {
    it('1投目は正常、2投目でバストした場合、正しく累積点数を計算する', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 10 },
          landingPoint: { x: 0, y: 0 },
          score: 10,
          ring: 'INNER_SINGLE',
          segmentNumber: 10,
        },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 50);
      expect(result).toEqual({
        isBust: true,
        reason: 'over',
      });
    });

    it('1投目、2投目は正常、3投目でバストした場合、正しく累積点数を計算する', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'SINGLE', number: 10 },
          landingPoint: { x: 0, y: 0 },
          score: 10,
          ring: 'INNER_SINGLE',
          segmentNumber: 10,
        },
        {
          target: { type: 'SINGLE', number: 15 },
          landingPoint: { x: 0, y: 0 },
          score: 15,
          ring: 'INNER_SINGLE',
          segmentNumber: 15,
        },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
      ];
      const result = checkBustFromThrows(throws, 50);
      expect(result).toEqual({
        isBust: true,
        reason: 'over',
      });
    });
  });

  describe('エッジケース', () => {
    it('空の配列の場合はundefinedを返す', () => {
      const throws: ThrowResult[] = [];
      const result = checkBustFromThrows(throws, 100);
      expect(result).toBeUndefined();
    });

    it('残り点数が2点でダブル1に入った場合はバストしない', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'DOUBLE', number: 1 },
          landingPoint: { x: 0, y: 0 },
          score: 2,
          ring: 'DOUBLE',
          segmentNumber: 1,
        },
      ];
      const result = checkBustFromThrows(throws, 2);
      expect(result).toBeUndefined();
    });

    it('残り点数が170点で全てトリプル20を狙うケース（バストなし）', () => {
      const throws: ThrowResult[] = [
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'TRIPLE', number: 20 },
          landingPoint: { x: 0, y: 0 },
          score: 60,
          ring: 'TRIPLE',
          segmentNumber: 20,
        },
        {
          target: { type: 'BULL', number: null },
          landingPoint: { x: 0, y: 0 },
          score: 50,
          ring: 'INNER_BULL',
        },
      ];
      const result = checkBustFromThrows(throws, 170);
      expect(result).toBeUndefined();
    });
  });
});
