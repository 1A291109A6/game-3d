const canvas = document.getElementById('Canvas');
const context = canvas.getContext('2d');

//ゲーム設定
const FPS = 30; //FPSを指定する
const Speed = 6; //移動速度
const rotation_speed = 1; //回転速度
const g = 9.8; //重力加速度

const rotationSpeed = rotation_speed * 2 * Math.PI / FPS;
const moveSpeed = Speed / FPS;

let angle = Math.PI / 2;
let angle2 = canvas.width / (Math.tan(angle / 2) * 2);
var player = [0, 0, 0, 0, 0];
var point =[];
var time = performance.now();
var v_up = 0;

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'ArrowLeft':
      player[0] -= moveSpeed * Math.cos(player[3]);
      player[2] += moveSpeed * Math.sin(player[3]);
      break;
    case 'ArrowRight':
      player[0] += moveSpeed * Math.cos(player[3]);
      player[2] -= moveSpeed * Math.sin(player[3]);
      break;
    case 'ArrowUp':
      player[0] += moveSpeed * Math.sin(player[3]);
      player[2] += moveSpeed * Math.cos(player[3]);
      break;
    case 'ArrowDown':
      player[0] -= moveSpeed * Math.sin(player[3]);
      player[2] -= moveSpeed * Math.cos(player[3]);
      break;
    case 'a':
      player[3] -= rotationSpeed;
      break;
    case 'd':
      player[3] += rotationSpeed;
      break;
    case 's':
      player[4] -= moveSpeed;
      if (player[4] < -Math.PI / 2) {
        player[4] = -Math.PI / 2;
      }
      break;
    case 'w':
      player[4] += moveSpeed;
      if (player[4] > Math.PI / 2) {
        player[4] = Math.PI / 2;
      }
      break;
    case 'q':
      player[1] += moveSpeed;
      break;
    case 'e':
      player[1] -= moveSpeed;
      break;
    case ' ':
      v_up = 5;
      break;
  }
});

function draw_plane(ax, ay, bx, by, cx, cy, dx, dy) {
  context.beginPath();
  context.moveTo(canvas.width / 2 + ax, canvas.height / 2 - ay);
  context.lineTo(canvas.width / 2 + bx, canvas.height / 2 - by);
  context.lineTo(canvas.width / 2 + cx, canvas.height / 2 - cy);
  context.lineTo(canvas.width / 2 + dx, canvas.height / 2 - dy);
  context.closePath();
  context.fillStyle = "blue";
  context.fill();
}

function convert_3Dto2D(x, y, z, cx, cy, cz, rx, ry) {
  if (cx == 0 && cy == 0 && cz == 0) {
    if (rx == 0) {
      if(ry == 0) {
        point.push(angle2 * x / z);
        point.push(angle2 * y / z);
      }else{
        convert_3Dto2D(x, y * Math.cos(ry) - z * Math.sin(ry), y * Math.sin(ry) + z * Math.cos(ry), 0, 0, 0, 0, 0);
      }
    }else{
      convert_3Dto2D(x * Math.cos(rx) - z * Math.sin(rx), y, x * Math.sin(rx) + z * Math.cos(rx), 0, 0, 0, 0, ry);
    }
  }else{
    convert_3Dto2D(x - cx, y - cy, z - cz, 0, 0, 0, rx, ry);
  }
}


function draw_3Dcube(x, y, z, cx, cy, cz, rx, ry) {
  point =[];
  convert_3Dto2D(x, y, z, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 1, y, z, cx, cy, cz, rx, ry);
  convert_3Dto2D(x, y - 1, z, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 1, y - 1, z, cx, cy, cz, rx, ry);
  convert_3Dto2D(x, y, z + 1, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 1, y, z + 1, cx, cy, cz, rx, ry);
  convert_3Dto2D(x, y - 1, z + 1, cx, cy, cz, rx, ry);
  convert_3Dto2D(x + 1, y - 1, z + 1, cx, cy, cz, rx, ry);
  if ((z - cz) > 0) {
    draw_plane(point[0], point[1], point[2], point[3], point[6], point[7], point[4], point[5]);
  }
  if ((x - cx) > 0) {
    draw_plane(point[0], point[1], point[4], point[5], point[12], point[13], point[8], point[9]);
  }
  if ((cx - x) > 1) {
    draw_plane(point[2], point[3], point[6], point[7], point[14], point[15], point[10], point[11]);
  }
  if ((cy - y) > 0) {
    draw_plane(point[0], point[1], point[2], point[3], point[10], point[11], point[8], point[9]);
  }
  if ((y - cy) > 1) {
    draw_plane(point[4], point[5], point[6], point[7], point[14], point[15], point[12], point[13]);
  }
  if ((cz - z) > 1) {
    draw_plane(point[8], point[9], point[10], point[11], point[14], point[15], point[12], point[13]);
  }
}

function c_movement() {
  v_up -= g / FPS;
  player[1] += v_up / FPS;
  if (player[1] < 0) {
    player[1] = 0;
    v_up = 0;
  }

}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if ((0 - player[0]) ^ 2 + (0 - player[1]) ^ 2 + (5 - player[2]) ^ 2 > 1) {
    draw_3Dcube(0, 0, 5, player[0], player[1], player[2], player[3], player[4]);
  }
  if ((2 - player[0]) ^ 2 + (0 - player[1]) ^ 2 + (5 - player[2]) ^ 2 > 1) {
    draw_3Dcube(2, 0, 5, player[0], player[1], player[2], player[3], player[4]);
  }
  if ((-2 - player[0]) ^ 2 + (0 - player[1]) ^ 2 + (10 - player[2]) ^ 2 > 1) {
    draw_3Dcube(-2, 0, 10, player[0], player[1], player[2], player[3], player[4]);
  }
  if ((0 - player[0]) ^ 2 + (2 - player[1]) ^ 2 + (5 - player[2]) ^ 2 > 1) {
    draw_3Dcube(0, 2, 5, player[0], player[1], player[2], player[3], player[4]);
  }
}

function displayCoordinates() {
  context.fillStyle = 'black';
  context.font = '16px Arial';
  context.fillText(`FPS: ${Math.floor(1000 / (performance.now() - time))}`, 10, 40);
  context.fillText(`X: ${Math.floor(player[0] * 10) / 10}, Y: ${Math.floor(player[1] * 10) / 10}, Z: ${Math.floor(player[2] * 10) / 10}, point(${Math.floor(point[4] * 10) / 10},${Math.floor(point[0] * 10) / 10})`, 10, 20);
}




setInterval(() => {
  c_movement();
  draw();
  displayCoordinates();
  time = performance.now();
}, 1000 / FPS);
