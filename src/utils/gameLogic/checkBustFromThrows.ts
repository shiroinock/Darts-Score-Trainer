import type { BustInfo, ThrowResult } from '../../types';
import { checkBust } from './checkBust';
import { isDoubleRing } from './isDoubleRing';

/**
 * 投擲結果の配列からバスト判定を実施する
 * 各投擲を順に処理し、最初にバストが発生した時点でその情報を返す
 * @param throws 投擲結果の配列
 * @param initialRemainingScore 初期残り点数
 * @returns バスト情報（バストしていない場合はundefined）
 */
export function checkBustFromThrows(
  throws: ThrowResult[],
  initialRemainingScore: number
): BustInfo | undefined {
  let currentRemaining = initialRemainingScore;

  for (const throwResult of throws) {
    const isDouble = isDoubleRing(throwResult.ring);
    const checkResult = checkBust(currentRemaining, throwResult.score, isDouble);

    // バストが発生した場合、その時点で判定を返す
    if (checkResult.isBust) {
      return checkResult;
    }

    // バストでなければ残り点数を更新して次の投擲へ
    currentRemaining -= throwResult.score;
  }

  return undefined;
}
