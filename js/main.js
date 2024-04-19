const canvas = document.getElementById('Canvas');
const context = canvas.getContext('2d');

var cosRx = 0;
var cosRy = 0;
var sinRx = 0;
var sinRx = 0;

//canvasをウィンドウに合わせる
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//スクロール不可にする
function disableScroll() {
  document.body.style.overflow = 'hidden';
};

disableScroll();

//ゲーム設定
const FPS = 60; //FPSを指定する
const Speed = 6; //移動速度
const rotation_speed = 0.3; //回転速度
const g = 9.8; //重力加速度
const FocalLength = 0.5;

const rotationSpeed = rotation_speed * 2 * Math.PI / FPS;
const moveSpeed = Speed / FPS;

let angle = Math.PI / 2; //視野
let angle2 = canvas.width / (Math.tan(angle / 2) * 2);
var player = [0, 10, 0, 0, 0]; //プレイヤーの初期位置
var point = [];
var time = performance.now();
var v_up = 0;
let nowFPS = 60;

function generateRandomArray(num) {
  const array = new Array(num * num * num);
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      for (let k = 0; k < num; k++) {
        array[num * num * i + num * j + k] = Math.floor(Math.random() * 6);
      }
    }
  }
  return array;
}

//読み込む一辺の数
var num_block = 5;
var map = generateRandomArray(num_block);


//プレイヤーとの距離が遠い順に並び替える
function sort_block() {
  // プレイヤーとの距離の二乗を計算
  var distance = [];
  var order = [];
  for (let i = 0; i < num_block; i++) {
    for (let j = 0; j < num_block; j++) {
      for (let k = 0; k < num_block; k++) {
        let block = num_block * num_block * i + num_block * j + k
        if (map[block] != 0) {
          order.push(block)
          distance.push(Math.pow(player[0] - k - 0.5, 2) + Math.pow(player[1] - j + 1, 2) + Math.pow(player[2] - i - 0.5, 2));
        }
      }
    }
  }
  // distance 配列を使用して order 配列をソート
  order.sort((a, b) => distance[order.indexOf(b)] - distance[order.indexOf(a)]);
  // order 配列を遠い順に並び替えた結果を格納する新しい配列
  sortedOrder = order;
}

//操作を円滑にできるようにする(毎フレーム処理)
class KeyControl {
  constructor() {
    //キーの状態
    this.keyStatus = {
      HOLD: 2,
      DOWN: 1,
      UNDOWN: 0,
      RELEASE: -1,
    }
    //nowのキー状態
    this.input = {
      keys: {
        up: false,
        down: false,
        right: false,
        left: false,
        w: false,
        a: false,
        s: false,
        d: false,
        q: false,
        e: false,
        space: false
      },
      //前のフレームのキー状態
      keysPrev: {
        up: false,
        down: false,
        right: false,
        left: false,
        w: false,
        a: false,
        s: false,
        d: false,
        q: false,
        e: false,
        space: false
      }
    }
    //キーが押されたらtrueを返す
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          this.input.keys.up = true;
          break;
        case 'ArrowDown':
          this.input.keys.down = true;
          break;
        case 'ArrowRight':
          this.input.keys.right = true;
          break;
        case 'ArrowLeft':
          this.input.keys.left = true;
          break;
        case 'w':
          this.input.keys.w = true;
          break;
        case 'a':
          this.input.keys.a = true;
          break;
        case 's':
          this.input.keys.s = true;
          break;
        case 'd':
          this.input.keys.d = true;
          break;
        case 'q':
          this.input.keys.q = true;
          break;
        case 'e':
          this.input.keys.e = true;
          break;
        case ' ':
          this.input.keys.space = true;
        }
    });
    //キーが離されたらfalseを返す
    document.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          this.input.keys.up = false;
          break;
        case 'ArrowDown':
          this.input.keys.down = false;
          break;
        case 'ArrowRight':
          this.input.keys.right = false;
          break;
        case 'ArrowLeft':
          this.input.keys.left = false;
          break;
        case 'w':
          this.input.keys.w = false;
          break;
        case 'a':
          this.input.keys.a = false;
          break;
        case 's':
          this.input.keys.s = false;
          break;
        case 'd':
          this.input.keys.d = false;
          break;
        case 'q':
          this.input.keys.q = false;
          break;
        case 'e':
          this.input.keys.e = false;
          break;
        case ' ':
          this.input.keys.space = false;
        }
    });
  }
  //キーの状態を確認する
  checkButton(key) {
    if(this.input.keys[key]){
      if(this.input.keysPrev[key] == false) {
        this.input.keysPrev[key] = true;
        return this.keyStatus.DOWN;
      }
      return this.keyStatus.HOLD;
    }else{
      if(this.input.keysPrev[key] == true) {
        this.input.keysPrev[key] = false;
        return this.keyStatus.RELEASE;
      }
      return this.keyStatus.UNDOWN;
    }
  }
  
}

const keyControl = new KeyControl();
//キー操作
function control() {
  //キーと行動の対応
  const keyActions = {
    'a': () => {
      movePlayer(-moveSpeed * Math.cos(player[3]), moveSpeed * Math.sin(player[3]));
    },
    'd': () => {
      movePlayer(moveSpeed * Math.cos(player[3]), -moveSpeed * Math.sin(player[3]));
    },
    'w': () => {
      movePlayer(moveSpeed * Math.sin(player[3]), moveSpeed * Math.cos(player[3]));
    },
    's': () => {
      movePlayer(-moveSpeed * Math.sin(player[3]), -moveSpeed * Math.cos(player[3]));
    },
    'left': () => {
      player[3] -= rotationSpeed;
    },
    'right': () => {
      player[3] += rotationSpeed;
    },
    'down': () => {
      player[4] = Math.max(player[4] - rotationSpeed, -Math.PI / 2);
    },
    'up': () => {
      player[4] = Math.min(player[4] + rotationSpeed, Math.PI / 2);
    },
    'q': () => {
      player[1] += moveSpeed;
    },
    'e': () => {
      player[1] -= moveSpeed;
    },
    'space': () => {
      if (player[1] === 0) {
        v_up = 4.95;
      }
    },
  };
  //行動する
  function movePlayer(dx, dz) {
    player[0] += dx;
    player[2] += dz;
  }
  //押されたキーから行動を決定する
  for (const key in keyActions) {
    if (keyControl.checkButton(key) === keyControl.keyStatus.HOLD) {
      keyActions[key]();
    }
  }
}

function set_color(c) {
  if (c == 1) {
    context.fillStyle = '#228b22';
  }
  if (c == 2) {
    context.fillStyle = '#006400';
  }
  if (c == 3) {
    context.fillStyle = '#882222';
  }
  if (c == 4) {
    context.fillStyle = '#222288';
  }
  if (c == 5) {
    context.fillStyle = '#640000';
  }
}

//面を描画
function draw_plane(ax, ay, bx, by, cx, cy, dx, dy, c) {
  //計算不可能領域に頂点があったら描画しない
  if (ax * bx * cx * dx != 0) {
    context.beginPath();
    context.moveTo(canvas.width / 2 + ax, canvas.height / 2 - ay);
    context.lineTo(canvas.width / 2 + bx, canvas.height / 2 - by);
    context.lineTo(canvas.width / 2 + cx, canvas.height / 2 - cy);
    context.lineTo(canvas.width / 2 + dx, canvas.height / 2 - dy);
    context.closePath();
    set_color(c);
    context.fill();
  }
}

//三次元の位置データを画面上の座標に変換
function convert_3Dto2D(x, y, z, cx, cy, cz, rx, ry) {
  if (cx == 0 && cy == 0 && cz == 0) {
    if (rx == 0) {
      if(ry == 0) {
        if (z > FocalLength) {
          point.push(angle2 * x / z);
          point.push(angle2 * y / z);
        }else{
          point.push(null);
          point.push(null);
        }
      }else{
        convert_3Dto2D(x, y * cosRy - z * sinRy, y * sinRy + z * cosRy, 0, 0, 0, 0, 0);
      }
    }else{
      convert_3Dto2D(x * cosRx - z * sinRx, y, x * sinRx + z * cosRx, 0, 0, 0, 0, ry);
    }
  }else{
    convert_3Dto2D(x - cx, y - cy, z - cz, 0, 0, 0, rx, ry);
  }
}



//立方体を描画
function draw_3Dcube(x, y, z, cx, cy, cz, rx, ry, c) {
  point =[];
  convert_3Dto2D(x - 0.5, y - 0.5, z - 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 0.5, y - 0.5, z - 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x - 0.5, y - 1.5, z - 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 0.5, y - 1.5, z - 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x - 0.5, y - 0.5, z + 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 0.5, y - 0.5, z + 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x - 0.5, y - 1.5, z + 0.5, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 0.5, y - 1.5, z + 0.5, cx, cy, cz, rx, ry);
  if (z - 0.5 > cz) {
    draw_plane(point[0], point[1], point[2], point[3], point[6], point[7], point[4], point[5], c);
  }
  if (x - 0.5 > cx) {
    draw_plane(point[0], point[1], point[4], point[5], point[12], point[13], point[8], point[9], c);
  }
  if (cx > x + 0.5) {
    draw_plane(point[2], point[3], point[6], point[7], point[14], point[15], point[10], point[11], c);
  }
  if (cy > y - 0.5) {
    draw_plane(point[0], point[1], point[2], point[3], point[10], point[11], point[8], point[9], c);
  }
  if (y - 1.5 > cy) {
    draw_plane(point[4], point[5], point[6], point[7], point[14], point[15], point[12], point[13], c);
  }
  if (cz > z + 0.5) {
    draw_plane(point[8], point[9], point[10], point[11], point[14], point[15], point[12], point[13], c);
  }
}

//重力を考慮
function c_movement() {
  v_up -= g / FPS;
  player[1] += v_up / FPS;
  if (player[1] < 0) {
    player[1] = 0;
    v_up = 0;
  }
}

//画面全体を描画する
function draw() {
  context.fillStyle = '#4169e1';
  context.fillRect(0, 0, canvas.width, canvas.height);
  sort_block();
  for (let i = 0; i < sortedOrder.length; i++) {
    cosRx = Math.cos(player[3]);
    cosRy = Math.cos(player[4]);
    sinRx = Math.sin(player[3]);
    sinRy = Math.sin(player[4]);
    draw_3Dcube(sortedOrder[i] % num_block, Math.floor(sortedOrder[i] / num_block) % num_block, Math.floor(sortedOrder[i] / (num_block * num_block)), player[0], player[1], player[2], player[3], player[4], map[sortedOrder[i]]);
  }
}

//デバック画面を表示
function displayCoordinates() {
  context.fillStyle = "rgba(80, 80, 80, 0.8)";
  context.fillRect(0, 0, 280, 50);
  context.fillStyle = 'white';
  context.font = '16px Arial';
  nowFPS = (nowFPS * 10 + 1000 / (performance.now() - time)) / 11
  context.fillText(`FPS: ${Math.floor(nowFPS)}`, 10, 40);
  context.fillText(`player(${Math.floor(player[0] * 10) / 10},${Math.floor(player[1] * 10) / 10},${Math.floor(player[2] * 10) / 10})  point(${Math.floor(point[4] * 10) / 10},${Math.floor(point[0] * 10) / 10})`, 10, 20);
}

//エフェクトをつける
function draw_effect() {
  //真ん中の十字を描画
  context.strokeStyle = "white";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(canvas.width / 2 + 10, canvas.height / 2);
  context.lineTo(canvas.width / 2 - 10, canvas.height / 2);
  context.stroke();
  context.beginPath();
  context.moveTo(canvas.width / 2 , canvas.height / 2 + 10);
  context.lineTo(canvas.width / 2 , canvas.height / 2 - 10);
  context.stroke();
}

setInterval(() => {
  c_movement();
  draw();
  control();
  draw_effect();
  displayCoordinates();
  time = performance.now();
}, 1000 / FPS);
