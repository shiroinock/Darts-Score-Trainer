import { describe, expect, it } from 'vitest';
import type { RingType } from '../../types';
import { isDoubleRing } from './isDoubleRing';

describe('isDoubleRing', () => {
  it('DOUBLE リングの場合はtrueを返す', () => {
    const ring: RingType = 'DOUBLE';
    expect(isDoubleRing(ring)).toBe(true);
  });

  it('INNER_BULL の場合はtrueを返す', () => {
    const ring: RingType = 'INNER_BULL';
    expect(isDoubleRing(ring)).toBe(true);
  });

  it('OUTER_BULL の場合はfalseを返す', () => {
    const ring: RingType = 'OUTER_BULL';
    expect(isDoubleRing(ring)).toBe(false);
  });

  it('TRIPLE リングの場合はfalseを返す', () => {
    const ring: RingType = 'TRIPLE';
    expect(isDoubleRing(ring)).toBe(false);
  });

  it('INNER_SINGLE リングの場合はfalseを返す', () => {
    const ring: RingType = 'INNER_SINGLE';
    expect(isDoubleRing(ring)).toBe(false);
  });

  it('OUTER_SINGLE リングの場合はfalseを返す', () => {
    const ring: RingType = 'OUTER_SINGLE';
    expect(isDoubleRing(ring)).toBe(false);
  });

  it('null の場合はfalseを返す', () => {
    expect(isDoubleRing(null)).toBe(false);
  });
});
