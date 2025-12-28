import type { Target } from '../../types/Target';

/**
 * PDC標準チェックアウト表に基づく固定ルックアップテーブル
 *
 * 残り点数に対する最適なターゲットを定義
 */
export const CHECKOUT_TABLE: Record<number, Target> = {
  // 2-40点: ダブルでフィニッシュ
  2: { type: 'DOUBLE', number: 1, label: 'D1' },
  4: { type: 'DOUBLE', number: 2, label: 'D2' },
  6: { type: 'DOUBLE', number: 3, label: 'D3' },
  8: { type: 'DOUBLE', number: 4, label: 'D4' },
  10: { type: 'DOUBLE', number: 5, label: 'D5' },
  12: { type: 'DOUBLE', number: 6, label: 'D6' },
  14: { type: 'DOUBLE', number: 7, label: 'D7' },
  16: { type: 'DOUBLE', number: 8, label: 'D8' },
  18: { type: 'DOUBLE', number: 9, label: 'D9' },
  20: { type: 'DOUBLE', number: 10, label: 'D10' },
  22: { type: 'DOUBLE', number: 11, label: 'D11' },
  24: { type: 'DOUBLE', number: 12, label: 'D12' },
  26: { type: 'DOUBLE', number: 13, label: 'D13' },
  28: { type: 'DOUBLE', number: 14, label: 'D14' },
  30: { type: 'DOUBLE', number: 15, label: 'D15' },
  32: { type: 'DOUBLE', number: 16, label: 'D16' },
  34: { type: 'DOUBLE', number: 17, label: 'D17' },
  36: { type: 'DOUBLE', number: 18, label: 'D18' },
  38: { type: 'DOUBLE', number: 19, label: 'D19' },
  40: { type: 'DOUBLE', number: 20, label: 'D20' },

  // 奇数点（シングルで調整）
  3: { type: 'SINGLE', number: 1, label: 'S1' }, // S1→D1
  5: { type: 'SINGLE', number: 1, label: 'S1' }, // S1→D2
  7: { type: 'SINGLE', number: 3, label: 'S3' }, // S3→D2
  9: { type: 'SINGLE', number: 1, label: 'S1' }, // S1→D4
  11: { type: 'SINGLE', number: 3, label: 'S3' }, // S3→D4
  13: { type: 'SINGLE', number: 5, label: 'S5' }, // S5→D4
  15: { type: 'SINGLE', number: 7, label: 'S7' }, // S7→D4
  17: { type: 'SINGLE', number: 9, label: 'S9' }, // S9→D4
  19: { type: 'SINGLE', number: 3, label: 'S3' }, // S3→D8
  21: { type: 'SINGLE', number: 5, label: 'S5' }, // S5→D8
  23: { type: 'SINGLE', number: 7, label: 'S7' }, // S7→D8
  25: { type: 'SINGLE', number: 9, label: 'S9' }, // S9→D8
  27: { type: 'SINGLE', number: 11, label: 'S11' }, // S11→D8
  29: { type: 'SINGLE', number: 13, label: 'S13' }, // S13→D8
  31: { type: 'SINGLE', number: 15, label: 'S15' }, // S15→D8
  33: { type: 'SINGLE', number: 1, label: 'S1' }, // S1→D16
  35: { type: 'SINGLE', number: 3, label: 'S3' }, // S3→D16
  37: { type: 'SINGLE', number: 5, label: 'S5' }, // S5→D16
  39: { type: 'SINGLE', number: 7, label: 'S7' }, // S7→D16
  41: { type: 'SINGLE', number: 9, label: 'S9' }, // S9→D16
  43: { type: 'SINGLE', number: 11, label: 'S11' }, // S11→D16
  45: { type: 'SINGLE', number: 13, label: 'S13' }, // S13→D16
  47: { type: 'SINGLE', number: 15, label: 'S15' }, // S15→D16
  49: { type: 'SINGLE', number: 17, label: 'S17' }, // S17→D16

  // 50点: BULL
  50: { type: 'BULL', number: null, label: 'BULL' },

  // 51-60点: 2投フィニッシュ用ターゲット
  51: { type: 'SINGLE', number: 11, label: 'S11' }, // S11→D20
  52: { type: 'SINGLE', number: 12, label: 'S12' }, // S12→D20
  53: { type: 'SINGLE', number: 13, label: 'S13' }, // S13→D20
  54: { type: 'SINGLE', number: 14, label: 'S14' }, // S14→D20
  55: { type: 'SINGLE', number: 15, label: 'S15' }, // S15→D20
  56: { type: 'SINGLE', number: 16, label: 'S16' }, // S16→D20
  57: { type: 'SINGLE', number: 17, label: 'S17' }, // S17→D20
  58: { type: 'SINGLE', number: 18, label: 'S18' }, // S18→D20
  59: { type: 'SINGLE', number: 19, label: 'S19' }, // S19→D20
  60: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20

  // 61-70点: 特定のトリプル
  61: { type: 'TRIPLE', number: 11, label: 'T11' }, // T11→D14
  62: { type: 'TRIPLE', number: 10, label: 'T10' }, // T10→D16
  63: { type: 'TRIPLE', number: 13, label: 'T13' }, // T13→D12
  64: { type: 'TRIPLE', number: 14, label: 'T14' }, // T14→D11
  65: { type: 'TRIPLE', number: 11, label: 'T11' }, // T11→D16
  66: { type: 'TRIPLE', number: 10, label: 'T10' }, // T10→D18
  67: { type: 'TRIPLE', number: 13, label: 'T13' }, // T13→D14
  68: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D7
  69: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D6
  70: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D8

  // 71-80点: T19, T13など
  71: { type: 'TRIPLE', number: 13, label: 'T13' }, // T13→D16
  72: { type: 'TRIPLE', number: 16, label: 'T16' }, // T16→D12
  73: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D8
  74: { type: 'TRIPLE', number: 14, label: 'T14' }, // T14→D16
  75: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→D12
  76: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D8
  77: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D10
  78: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D12
  79: { type: 'TRIPLE', number: 13, label: 'T13' }, // T13→D20
  80: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D10

  // 81-90点: T19, T17など
  81: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D12
  82: { type: 'TRIPLE', number: 14, label: 'T14' }, // T14→D20
  83: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→D16
  84: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D12
  85: { type: 'TRIPLE', number: 15, label: 'T15' }, // T15→D20
  86: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D16
  87: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→D18
  88: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D14
  89: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D16
  90: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D18

  // 91-100点: T17, T20など
  91: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→D20
  92: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D16
  93: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D18
  94: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→D20
  95: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D19
  96: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D18
  97: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D20
  98: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D19
  99: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  100: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D20

  // 101-110点: T20, T19, T17など
  101: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→BULL
  102: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→次投で調整
  103: { type: 'TRIPLE', number: 17, label: 'T17' }, // T17→次投で調整
  104: { type: 'TRIPLE', number: 18, label: 'T18' }, // T18→BULL
  105: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→D24
  106: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D23
  107: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→BULL
  108: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→D24
  109: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  110: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→BULL

  // 111-120点
  111: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  112: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→次投で調整
  113: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  114: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→次投で調整
  115: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  116: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→次投で調整
  117: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  118: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→次投で調整
  119: { type: 'TRIPLE', number: 19, label: 'T19' }, // T19→次投で調整
  120: { type: 'TRIPLE', number: 20, label: 'T20' }, // T20→S20→D20

  // 121-170点: 基本的にT20
  121: { type: 'TRIPLE', number: 20, label: 'T20' },
  122: { type: 'TRIPLE', number: 20, label: 'T20' },
  123: { type: 'TRIPLE', number: 20, label: 'T20' },
  124: { type: 'TRIPLE', number: 20, label: 'T20' },
  125: { type: 'TRIPLE', number: 20, label: 'T20' },
  126: { type: 'TRIPLE', number: 20, label: 'T20' },
  127: { type: 'TRIPLE', number: 20, label: 'T20' },
  128: { type: 'TRIPLE', number: 20, label: 'T20' },
  129: { type: 'TRIPLE', number: 20, label: 'T20' },
  130: { type: 'TRIPLE', number: 20, label: 'T20' },
  131: { type: 'TRIPLE', number: 20, label: 'T20' },
  132: { type: 'TRIPLE', number: 20, label: 'T20' },
  133: { type: 'TRIPLE', number: 20, label: 'T20' },
  134: { type: 'TRIPLE', number: 20, label: 'T20' },
  135: { type: 'TRIPLE', number: 20, label: 'T20' },
  136: { type: 'TRIPLE', number: 20, label: 'T20' },
  137: { type: 'TRIPLE', number: 20, label: 'T20' },
  138: { type: 'TRIPLE', number: 20, label: 'T20' },
  139: { type: 'TRIPLE', number: 20, label: 'T20' },
  140: { type: 'TRIPLE', number: 20, label: 'T20' },
  141: { type: 'TRIPLE', number: 20, label: 'T20' },
  142: { type: 'TRIPLE', number: 20, label: 'T20' },
  143: { type: 'TRIPLE', number: 20, label: 'T20' },
  144: { type: 'TRIPLE', number: 20, label: 'T20' },
  145: { type: 'TRIPLE', number: 20, label: 'T20' },
  146: { type: 'TRIPLE', number: 20, label: 'T20' },
  147: { type: 'TRIPLE', number: 20, label: 'T20' },
  148: { type: 'TRIPLE', number: 20, label: 'T20' },
  149: { type: 'TRIPLE', number: 20, label: 'T20' },
  150: { type: 'TRIPLE', number: 20, label: 'T20' },
  151: { type: 'TRIPLE', number: 20, label: 'T20' },
  152: { type: 'TRIPLE', number: 20, label: 'T20' },
  153: { type: 'TRIPLE', number: 20, label: 'T20' },
  154: { type: 'TRIPLE', number: 20, label: 'T20' },
  155: { type: 'TRIPLE', number: 20, label: 'T20' },
  156: { type: 'TRIPLE', number: 20, label: 'T20' },
  157: { type: 'TRIPLE', number: 20, label: 'T20' },
  158: { type: 'TRIPLE', number: 20, label: 'T20' },
  159: { type: 'TRIPLE', number: 20, label: 'T20' },
  160: { type: 'TRIPLE', number: 20, label: 'T20' },
  161: { type: 'TRIPLE', number: 20, label: 'T20' },
  162: { type: 'TRIPLE', number: 20, label: 'T20' },
  163: { type: 'TRIPLE', number: 20, label: 'T20' },
  164: { type: 'TRIPLE', number: 20, label: 'T20' },
  165: { type: 'TRIPLE', number: 20, label: 'T20' },
  166: { type: 'TRIPLE', number: 20, label: 'T20' },
  167: { type: 'TRIPLE', number: 20, label: 'T20' },
  168: { type: 'TRIPLE', number: 20, label: 'T20' },
  169: { type: 'TRIPLE', number: 20, label: 'T20' },
  170: { type: 'TRIPLE', number: 20, label: 'T20' },
};

/**
 * チェックアウト表のキー範囲（2-170点）
 */
export const CHECKOUT_RANGES = {
  MIN: 2 as const,
  MAX: 170 as const,
} as const;
