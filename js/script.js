const canvas = document.getElementById('Canvas');
const context = canvas.getContext('2d');

//ゲーム設定
const FPS = 30; //FPSを指定する
const Speed = 1;
const moveSpeed = Speed / FPS;

let angle = Math.PI / 2;
let angle2 = canvas.width / (Math.tan(angle / 2) * 2);
var player = [0, 0, 0, 0, 0];
var point =[];

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'ArrowLeft':
      player[0] -= moveSpeed;
      break;
    case 'ArrowRight':
      player[0] += moveSpeed;
      break;
    case 'ArrowUp':
      player[2] += moveSpeed;
      break;
    case 'ArrowDown':
      player[2] -= moveSpeed;
      break;
    case 'a':
      player[3] -= moveSpeed;
      break;
    case 'd':
      player[3] += moveSpeed;
      break;
    case 's':
      player[4] -= moveSpeed;
      break;
    case 'w':
      player[4] += moveSpeed;
      break;
    case 'q':
      player[1] += moveSpeed;
      break;
    case 'e':
      player[1] -= moveSpeed;
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

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  draw_3Dcube(0, 0, 5, player[0], player[1], player[2], player[3], player[4])
}

function displayCoordinates() {
  context.fillStyle = 'black';
  context.font = '16px Arial';
  context.fillText(`X: ${player[0]}, Y: ${player[1]}, Z: ${player[2]}, point(${point[4]},${point[5]})`, 10, 20);
}




setInterval(() => {
  draw();
  displayCoordinates();
}, 1000 / FPS);