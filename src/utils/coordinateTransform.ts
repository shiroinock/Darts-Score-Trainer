/**
 * 座標変換クラス
 * 物理座標（mm）と画面座標（pixel）を相互変換する
 */
export class CoordinateTransform {
  private canvasWidth: number;
  private canvasHeight: number;
  private boardPhysicalRadius: number;
  private scale: number; // 小さい方の次元のスケール（getScaleで返す）
  private scaleX: number; // X方向のスケール
  private scaleY: number; // Y方向のスケール
  private centerX: number;
  private centerY: number;

  /**
   * コンストラクタ
   * @param canvasWidth キャンバスの幅（ピクセル）
   * @param canvasHeight キャンバスの高さ（ピクセル）
   * @param boardPhysicalRadius ボードの物理半径（mm）
   * @throws {Error} パラメータが0以下の場合
   */
  constructor(canvasWidth: number, canvasHeight: number, boardPhysicalRadius: number) {
    if (canvasWidth <= 0 || canvasHeight <= 0 || boardPhysicalRadius <= 0) {
      throw new Error('Canvas size and board radius must be positive');
    }

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.boardPhysicalRadius = boardPhysicalRadius;

    this.calculateTransform();
  }

  /**
   * スケールと中心座標を計算する
   * @private
   */
  private calculateTransform(): void {
    // X方向とY方向でそれぞれスケールを計算
    this.scaleX = this.canvasWidth / (2 * this.boardPhysicalRadius);
    this.scaleY = this.canvasHeight / (2 * this.boardPhysicalRadius);

    // getScaleで返すスケールは小さい方の80%
    this.scale = Math.min(this.scaleX, this.scaleY) * 0.8;

    // キャンバスの中心を計算
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
  }

  /**
   * 物理座標を画面座標に変換する
   * @param x 物理X座標（mm）
   * @param y 物理Y座標（mm）
   * @returns 画面座標 { x, y }（ピクセル）
   */
  physicalToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: this.centerX + x * this.scaleX,
      y: this.centerY + y * this.scaleY,
    };
  }

  /**
   * 画面座標を物理座標に変換する
   * @param x 画面X座標（ピクセル）
   * @param y 画面Y座標（ピクセル）
   * @returns 物理座標 { x, y }（mm）
   */
  screenToPhysical(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.centerX) / this.scaleX,
      y: (y - this.centerY) / this.scaleY,
    };
  }

  /**
   * 物理距離を画面距離に変換する
   * @param distance 物理距離（mm）
   * @returns 画面距離（ピクセル）
   */
  physicalDistanceToScreen(distance: number): number {
    return Math.abs(distance) * this.scale;
  }

  /**
   * 画面距離を物理距離に変換する
   * @param distance 画面距離（ピクセル）
   * @returns 物理距離（mm）
   */
  screenDistanceToPhysical(distance: number): number {
    return Math.abs(distance) / this.scale;
  }

  /**
   * キャンバスサイズを更新する
   * @param width 新しい幅（ピクセル）
   * @param height 新しい高さ（ピクセル）
   * @throws {Error} パラメータが0以下の場合
   */
  updateCanvasSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error('Canvas size must be positive');
    }

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.calculateTransform();
  }

  /**
   * スケール値を取得する
   * @returns スケール値（ピクセル/mm）
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * キャンバス中心座標を取得する
   * @returns 中心座標 { x, y }（ピクセル）
   */
  getCenter(): { x: number; y: number } {
    return {
      x: this.centerX,
      y: this.centerY,
    };
  }
}
