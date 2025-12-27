function _setup() {
  createCanvas(750, 750);
  background(100);
}

function _draw() {
  strokeWeight(4.5);

  // var surround = color(10, 10, 10);
  // var spider = color(10, 10, 10);
  // var black = color(17, 17, 15);
  // var white = color(236, 224, 202);
  // var red = color(191, 34, 35);
  // var green = color(25, 179, 145);

  var surround = color(20, 20, 20);
  var spider = color(40, 40, 40);
  var black = color(17, 17, 15);
  var white = color(191, 34, 35);
  var red = color(191, 34, 35);
  var green = color(17, 17, 15);

  var rate = 1 / 10;
  var diff = PI * rate;
  var start = (PI * 1) / 20;
  var end1 = start + diff;
  var end2 = end1 + diff;
  var end3 = end2 + diff;
  var end4 = end3 + diff;
  var end5 = end4 + diff;
  var end6 = end5 + diff;
  var end7 = end6 + diff;
  var end8 = end7 + diff;
  var end9 = end8 + diff;
  var end10 = end9 + diff;
  var end11 = end10 + diff;
  var end12 = end11 + diff;
  var end13 = end12 + diff;
  var end14 = end13 + diff;
  var end15 = end14 + diff;
  var end16 = end15 + diff;
  var end17 = end16 + diff;
  var end18 = end17 + diff;
  var end19 = end18 + diff;
  var end20 = end19 + diff;

  // サラウンド
  fill(surround);
  ellipse(375, 375, 565, 565);

  // スパイダー
  stroke(spider);

  // ダブルリング
  fill(red);
  arc(375, 375, 393, 393, start, end1, PIE);
  fill(green);
  arc(375, 375, 393, 393, end1, end2, PIE);
  fill(red);
  arc(375, 375, 393, 393, end2, end3, PIE);
  fill(green);
  arc(375, 375, 393, 393, end3, end4, PIE);
  fill(red);
  arc(375, 375, 393, 393, end4, end5, PIE);
  fill(green);
  arc(375, 375, 393, 393, end5, end6, PIE);
  fill(red);
  arc(375, 375, 393, 393, end6, end7, PIE);
  fill(green);
  arc(375, 375, 393, 393, end7, end8, PIE);
  fill(red);
  arc(375, 375, 393, 393, end8, end9, PIE);
  fill(green);
  arc(375, 375, 393, 393, end9, end10, PIE);
  fill(red);
  arc(375, 375, 393, 393, end10, end11, PIE);
  fill(green);
  arc(375, 375, 393, 393, end11, end12, PIE);
  fill(red);
  arc(375, 375, 393, 393, end12, end13, PIE);
  fill(green);
  arc(375, 375, 393, 393, end13, end14, PIE);
  fill(red);
  arc(375, 375, 393, 393, end14, end15, PIE);
  fill(green);
  arc(375, 375, 393, 393, end15, end16, PIE);
  fill(red);
  arc(375, 375, 393, 393, end16, end17, PIE);
  fill(green);
  arc(375, 375, 393, 393, end17, end18, PIE);
  fill(red);
  arc(375, 375, 393, 393, end18, end19, PIE);
  fill(green);
  arc(375, 375, 393, 393, end19, end20, PIE);

  // アウターシングル
  fill(black);
  arc(375, 375, 354, 354, start, end1, PIE);
  fill(white);
  arc(375, 375, 354, 354, end1, end2, PIE);
  fill(black);
  arc(375, 375, 354, 354, end2, end3, PIE);
  fill(white);
  arc(375, 375, 354, 354, end3, end4, PIE);
  fill(black);
  arc(375, 375, 354, 354, end4, end5, PIE);
  fill(white);
  arc(375, 375, 354, 354, end5, end6, PIE);
  fill(black);
  arc(375, 375, 354, 354, end6, end7, PIE);
  fill(white);
  arc(375, 375, 354, 354, end7, end8, PIE);
  fill(black);
  arc(375, 375, 354, 354, end8, end9, PIE);
  fill(white);
  arc(375, 375, 354, 354, end9, end10, PIE);
  fill(black);
  arc(375, 375, 354, 354, end10, end11, PIE);
  fill(white);
  arc(375, 375, 354, 354, end11, end12, PIE);
  fill(black);
  arc(375, 375, 354, 354, end12, end13, PIE);
  fill(white);
  arc(375, 375, 354, 354, end13, end14, PIE);
  fill(black);
  arc(375, 375, 354, 354, end14, end15, PIE);
  fill(white);
  arc(375, 375, 354, 354, end15, end16, PIE);
  fill(black);
  arc(375, 375, 354, 354, end16, end17, PIE);
  fill(white);
  arc(375, 375, 354, 354, end17, end18, PIE);
  fill(black);
  arc(375, 375, 354, 354, end18, end19, PIE);
  fill(white);
  arc(375, 375, 354, 354, end19, end20, PIE);

  // トリプルリング
  fill(red);
  arc(375, 375, 252, 252, start, end1, PIE);
  fill(green);
  arc(375, 375, 252, 252, end1, end2, PIE);
  fill(red);
  arc(375, 375, 252, 252, end2, end3, PIE);
  fill(green);
  arc(375, 375, 252, 252, end3, end4, PIE);
  fill(red);
  arc(375, 375, 252, 252, end4, end5, PIE);
  fill(green);
  arc(375, 375, 252, 252, end5, end6, PIE);
  fill(red);
  arc(375, 375, 252, 252, end6, end7, PIE);
  fill(green);
  arc(375, 375, 252, 252, end7, end8, PIE);
  fill(red);
  arc(375, 375, 252, 252, end8, end9, PIE);
  fill(green);
  arc(375, 375, 252, 252, end9, end10, PIE);
  fill(red);
  arc(375, 375, 252, 252, end10, end11, PIE);
  fill(green);
  arc(375, 375, 252, 252, end11, end12, PIE);
  fill(red);
  arc(375, 375, 252, 252, end12, end13, PIE);
  fill(green);
  arc(375, 375, 252, 252, end13, end14, PIE);
  fill(red);
  arc(375, 375, 252, 252, end14, end15, PIE);
  fill(green);
  arc(375, 375, 252, 252, end15, end16, PIE);
  fill(red);
  arc(375, 375, 252, 252, end16, end17, PIE);
  fill(green);
  arc(375, 375, 252, 252, end17, end18, PIE);
  fill(red);
  arc(375, 375, 252, 252, end18, end19, PIE);
  fill(green);
  arc(375, 375, 252, 252, end19, end20, PIE);

  // インナーシングル
  fill(black);
  arc(375, 375, 212, 212, start, end1, PIE);
  fill(white);
  arc(375, 375, 212, 212, end1, end2, PIE);
  fill(black);
  arc(375, 375, 212, 212, end2, end3, PIE);
  fill(white);
  arc(375, 375, 212, 212, end3, end4, PIE);
  fill(black);
  arc(375, 375, 212, 212, end4, end5, PIE);
  fill(white);
  arc(375, 375, 212, 212, end5, end6, PIE);
  fill(black);
  arc(375, 375, 212, 212, end6, end7, PIE);
  fill(white);
  arc(375, 375, 212, 212, end7, end8, PIE);
  fill(black);
  arc(375, 375, 212, 212, end8, end9, PIE);
  fill(white);
  arc(375, 375, 212, 212, end9, end10, PIE);
  fill(black);
  arc(375, 375, 212, 212, end10, end11, PIE);
  fill(white);
  arc(375, 375, 212, 212, end11, end12, PIE);
  fill(black);
  arc(375, 375, 212, 212, end12, end13, PIE);
  fill(white);
  arc(375, 375, 212, 212, end13, end14, PIE);
  fill(black);
  arc(375, 375, 212, 212, end14, end15, PIE);
  fill(white);
  arc(375, 375, 212, 212, end15, end16, PIE);
  fill(black);
  arc(375, 375, 212, 212, end16, end17, PIE);
  fill(white);
  arc(375, 375, 212, 212, end17, end18, PIE);
  fill(black);
  arc(375, 375, 212, 212, end18, end19, PIE);
  fill(white);
  arc(375, 375, 212, 212, end19, end20, PIE);

  // アウターブル
  fill(red);
  ellipse(375, 375, 44, 44);

  noStroke();

  // インナーブル
  fill(black);
  ellipse(375, 375, 17, 17);

  // ナンバー表記
  fill(255, 255, 255);
  textSize(36);
  textFont('Arial');
  textAlign(CENTER, CENTER);
  text('20', 375, 150);
  text('1', 446, 159);
  text('18', 510, 193);
  text('4', 560, 243);
  text('13', 592, 308);
  text('6', 604, 377);
  text('10', 592, 447);
  text('15', 560, 513);
  text('2', 510, 563);
  text('17', 446, 596);
  text('3', 375, 607);
  text('19', 305, 596);
  text('7', 241, 563);
  text('16', 189, 513);
  text('8', 157, 447);
  text('11', 147, 377);
  text('14', 157, 308);
  text('9', 189, 243);
  text('12', 241, 193);
  text('5', 305, 159);

  //   [...new Array(20)].forEach((_, i) => {
  //   const _rad = i / 20 * PI * 2; // 角度を求める
  //   const x = 230 * cos(_rad) + 375; // x座標を求める
  //   const y = 230 * sin(_rad) + 375; // y座標を求める
  //   ellipse(x, y, 10, 10); // 円を描画する
  // })
}
