'use strict';

let debug = false; // is the debug panel switched on?
let canvas; // canvas element
let context; // drawing context for canvas element
let lovelyCol; // css color for lovely class
let step; // how big is the grid
let halfWidth; // half the screen width - avoids recalculating
let halfHeight; // half the screen width - avoids recalculating
let limitOfAcceleration; // distance from the center beyond which you're going no faster

const colours = [
  '#F0F',
  '#88F',
  '#8F8',
  '#808',
];

// Grid position
// To animate th egrid it needs an x and y position that is altered slightly every step..
// the xStop and yStop values are the upper bounds to which to count when drawing lines...
// i.e. go from 0 until this and then stop.
const grid = {
  xOffset: 0,
  yOffset: 0,
  xStop: 300,
  yStop: 300,
};

// debugging counters
const counters = {
  loop: 0,
  vert: 0,
  horiz: 0,
};

// mouse position
const pointer = {
  colIndex: 0, // index of the current colour as selected from the colours array
  x: 0, // on screen x
  y: 0, // on screen y
  xOffset: 0, // x relative to screen centre
  yOffset: 0, // y relative to screen centre
  angle: 0, // angle of xy point relative to screen centre (0-2*PI)
  degrees: 'todo', // angle of xy point relative to screen centre in degrees
  radius: 1, // distance from centre of mouse point (i.e the hypotenuse)
};


function calculateStops() {
  grid.xStop = grid.xOffset + canvas.width + step;
  grid.yStop = grid.yOffset + canvas.height + step;
}


function scaleRangeChanged(e) {
  // so update scalenumber
  window.scalenumber.value = window.scalerange.value;
  if (typeof updateStep === 'function') {
    updateStep();
  }
  redraw(e);
}

function scaleNumberChanged(e) {
  // so update scalerange
  window.scalerange.value = window.scalenumber.value;
  if (typeof updateStep === 'function') {
    updateStep();
  }
  redraw(e);
}


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  halfWidth = canvas.width / 2;
  halfHeight = canvas.height / 2;
  limitOfAcceleration = Math.min(halfWidth, halfHeight) / 2; // halfway to the nearest window edge
  redraw();
}


function mouseMoved(e) {
  // position of the pointer within the canvas
  pointer.x = (e.pageX - canvas.offsetLeft);
  pointer.y = (e.pageY - canvas.offsetTop);

  // position of the pointer relative to the centre of the canvas
  pointer.xOffset = pointer.x - halfWidth;
  pointer.yOffset = pointer.y - halfHeight;

  // TODO calulate angle and unit vector radius
  // based on mouse.xOffset and mouse.yOffset .
  pointer.radius =
  Math.min(
    Math.sqrt(
      Math.pow(pointer.xOffset, 2) +
      Math.pow(pointer.yOffset, 2)
    ),
    limitOfAcceleration,
  ) / limitOfAcceleration * step;

  pointer.angle = Math.atan2(pointer.yOffset, pointer.xOffset).toFixed(3);

  redraw();
}


function handleKeys(e) {
  if (e.code === 'KeyD') {
    debug = !debug;
    window.controls.classList.toggle('hidden');
  }
  if (e.code === 'KeyL') {
    window.leaderboard.classList.toggle('hidden');
  }
  if (e.code === 'KeyP') {
    window.player.classList.toggle('hidden');
  }

  if (e.target === window.nick) {
    if (e.code === 'Enter') {
      window.player.classList.add('hidden');
    }
  }
}


function redraw() {
  calculateStops();
  drawGrid();
  if (drawUserPos) {
    drawUserPos();
  }
  if (drawPointerPos) {
    drawPointerPos();
  }
  if (debug) {
    drawDebugScaffold();
    feedbackPositions();
  }
}


function feedbackPositions() {
  window.mx.textContent = pointer.x;
  window.my.textContent = pointer.y;
  window.ox.textContent = pointer.xOffset;
  window.oy.textContent = pointer.yOffset;
  window.angle.textContent = pointer.angle;
  window.degrees.textContent = pointer.degrees;
  window.radius.textContent = pointer.radius.toFixed(3);
  window.gv.textContent = counters.vert;
  window.gh.textContent = counters.horiz;
  window.loops.textContent = counters.loop;
}


function loop() {
  counters.loop++;

  // how much to offset the grid by based on the pointer position
  grid.xOffset -= pointer.radius * Math.cos(pointer.angle) / 10;
  grid.yOffset -= pointer.radius * Math.sin(pointer.angle) / 10;

  grid.xOffset %= step;
  grid.yOffset %= step;

  redraw();
  window.requestAnimationFrame(loop);
}


function drawGrid() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.lineWidth = 1;

  // verticals
  counters.vert = 0;
  for (let i = grid.xOffset; i <= grid.xStop; i += step) {
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
    counters.vert++; // keep a tally on vertical gridlines counters
  }

  // horizontals
  counters.horiz = 0;
  for (let i = grid.yOffset; i <= grid.yStop; i += step) {
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    counters.horiz++; // keep a tally on horizontal gridlines drawn
  }

  context.strokeStyle = lovelyCol;
  context.stroke();
}


function drawDebugScaffold() {
  drawNormalizedMousePosition();
  drawXYMousePosition();
}

function drawNormalizedMousePosition() {
  const x = halfWidth + pointer.radius * Math.cos(pointer.angle);
  const y = halfHeight + pointer.radius * Math.sin(pointer.angle);

  context.beginPath();
  context.lineWidth = 8;
  context.strokeStyle = '#0f0';
  context.moveTo(halfWidth, halfHeight);
  context.lineTo(x, y);
  context.stroke();
}

function drawXYMousePosition() {
  context.beginPath();
  context.lineWidth = 4;
  context.strokeStyle = '#ff0';
  context.moveTo(halfWidth, halfHeight);
  context.lineTo(halfWidth + pointer.xOffset, halfHeight + pointer.yOffset);
  context.stroke();
}


function drawPointerPos() {
  // Implement me!
}

function drawUserPos() {
  // Implement me!
}


function init() {
  canvas = window.c1;
  context = canvas.getContext('2d');
  step = parseInt(window.scalerange.value);

  document.body.classList.add('lovely');

  lovelyCol = window.getComputedStyle(document.querySelector('.lovely')).getPropertyValue('color');


  // listeners
  window.scalerange.addEventListener('input', scaleRangeChanged);
  window.scalenumber.addEventListener('input', scaleNumberChanged);

  // mouse
  canvas.addEventListener('mousemove', mouseMoved);

  // resize
  window.addEventListener('resize', resizeCanvas);

  // keyboard input d,p,l, etc.
  window.addEventListener('keydown', handleKeys);

  resizeCanvas();
  window.requestAnimationFrame(loop);
}

window.addEventListener('load', init);
