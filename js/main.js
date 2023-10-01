let canvas, context;
let masu, blocks;
let score, status, gameOverLabel;

class Block {
  constructor(x, y) {
    this.pos = {x: x * 150, y: y * 150};
    this.target = {x: x, y: y} // 移動先のマスの位置
    this.n = 0 // スコア
    if (Math.random() < 0.2) this.n++; // 20%の確率で初期値変更
    this.status = "stop";
    this.targetIndex = -1;
    this.chars = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐔", "🐶", "🐗"];
  }

  move() {
    const vx = Math.sign(this.target.x * 150 - this.pos.x) * 15;
    const vy = Math.sign(this.target.y * 150 - this.pos.y) * 15;
    this.pos = {x: this.pos.x + vx, y: this.pos.y + vy};
    if ((vx === 0) && (vy === 0)) this.status = "stop";
  }

  draw() {
    // 背景を描画
    const grad = context.createRadialGradient(this.pos.x + 75, this.pos.y + 75, 30, this.pos.x + 75, this.pos.y + 75, 75);
    grad.addColorStop(0.0, `hsl(${(this.n + 2) * 30}, 80%, 88%)`);
    grad.addColorStop(1.0, `hsl(${(this.n + 2) * 30}, 90%, 80%)`);
    context.fillStyle = grad;
    context.fillRect(this.pos.x + 6, this.pos.y + 6, 138, 138);
    // 絵文字を描画
    context.fillStyle = "#3f4144";
    context.font = "64px sans-serif";
    context.textAlign = "center";
    const char = this.chars[this.n % this.chars.length];
    context.fillText(char, this.pos.x + 75, this.pos.y + 80);
    // nの表示
    context.fillStyle = `hsl(${(this.n + 2) * 30}, 60%, 20%)`;
    context.font = "bold 32px sans-serif";
    context.textAlign = "centor";
    context.fillText(this.n + 1, this.pos.x + 75, this.pos.y + 30);
  }
}

const init = () => {
  canvas = document.getElementById("board");
  context = canvas.getContext("2d");
  context.textBaseline = "middle";
  // キーイベント
  document.addEventListener("keydown", (event) => {
    if (status !== "ready") return;
    const key = event.key;
    const dir = {ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right"}[key];
    if (cntMoveBlocks(dir)) {
      status = "move"
    }
  });
  initGame();
  update();
}

const initGame = () => {
  masu = [];
  blocks = [];
  for (let i = 0; i < 4; i++) {
    masu[i] = new Array(4).fill(null);
  }
  addBlock();
  addBlock();
  score = 0;
  gameOverLabel = "";
  status = "ready";
}
const addBlock = () => {
  const masu0 = new Array();
  // 空いているマスの位置
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (masu[y][x] === null) masu0.push({x: x, y: y});
    }
  }
  // ランダムにマスを選択
  if (masu0.length > 0) {
    const index = Math.floor(Math.random() * masu0.length);
    const pos = masu0[index];
    const block = new Block(pos.x, pos.y);
    blocks.push(block);
    masu[pos.y][pos.x] = blocks.length - 1;
  }
  // 隣に等しいnを持つブロックがあるかチェック
  if (masu0.length === 1) {
    let check = true;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (check && (masu[y][x] !== null)) {
          const n = blocks[masu[y][x]].n;
          if ((y < 3) && (blocks[masu[y + 1][x]].n === n)) {
            check = false;
          }
          if ((x < 3) && (blocks[masu[y][x + 1]].n === n)) {
            check = false;
          }
        }
      }
    }
    if (check) {
      gameOverLabel = "GAMEOVER";
    }
  }
}

// cntMoveBlocks ブロックの移動可能回数をカウント

const cntMoveBlocks = (dir) => {
  let cnt = 0;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let tx = x;
      let ty = y;
      if (dir === "right") tx = 3 - x
      else if (dir === "down") ty = 3 - y;
      if (masu[ty][tx] !== null) {
        cnt += moveBlocks(dir, tx, ty);
      }
    }
  }
  return cnt;
}

const moveBlocks = (dir, x, y) => {
  let cnt = 0;
  let check = false;
  // 現在の位置、移動方向、移動終了位置
  let [sx, sy, dx, dy, ex, ey] = [x, y, 0, 0, x, y];
  // 移動方向によって移動終了位置を設定
  if (dir === "up") [dy, ey] = [-1, 0];
  else if (dir === "down") [dy, ey] = [1, 3];
  else if (dir === "left") [dx, ex] = [-1, 0];
  else if (dir === "right") [dx, ex] = [1, 3];
  // 移動終了位置まで移動
  while ((ex !== sx) || (ey !== sy)) {
    const [tx, ty] = [sx + dx, sy + dy];
    const block = blocks[masu[sy][sx]];
    const target = blocks[masu[ty][tx]];
    // 移動先が空の場合
    if (masu[ty][tx] === null) {
      masu[ty][tx] = masu[sy][sx];
      masu[sy][sx] = null;
      block.target = {x: tx, y: ty};
      block.status = "move";
      cnt++;
    } else if ((block.n === target.n) && (target.targetIndex === -1)) {
      block.target = {x: tx, y: ty};
      block.status = "move";
      block.targetIndex = masu[ty][tx];
      masu[ty][tx] = masu[sy][sx];
      masu[sy][sx] = null;
      cnt = cnt + 1;
      check = true;
    }
    [sx, sy] = [tx, ty];
    if (check) break; // 合体するブロックがあるなら繰り返し終了
  }
  return cnt
}

const update = () => {
  // ブロックの移動
  context.fillStyle = "#f3f3f6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // blocksの要素を移動させる
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.status === "move") {
      block.move();
    }
    // statusがstopで合体するブロックがあるなら
    if ((block.status === "stop") && (block.targetIndex !== -1)) {
      // 合体先ブロックのステータスを dead に設定
      blocks[block.targetIndex].status = "dead";
      // 合体先ブロックのスコアを加算
      block.n = block.n + 1;
      block.targetIndex = -1;
      score += block.n;
    }
  }
  // 枠線を描画
  context.fillStyle = "#d2d6dd";
  for (let i = 0; i < 5; i++) {
    context.fillRect(0, i * 150 - 2, 600, 4);
    context.fillRect(i * 150 - 2, 0, 4, 600);
  }
  // 描画
  let moving = false;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.status === "move") moving = true;
    if (block.status !== "dead") block.draw();
  }
  // 移動が完了したら新しいブロックを追加
  if (!moving && (status === "move")) {
    addBlock();
    status = "ready";
  }
  // #score にスコアを表示
  document.getElementById("score").textContent = score;
  document.getElementById("gameOverLabel").textContent = gameOverLabel;
  window.requestAnimationFrame(update);
}

// initGameButtonをクリックしたらinitGameを呼び出す
document.getElementById("initGameButton").onclick = initGame;

document.onload = init();
