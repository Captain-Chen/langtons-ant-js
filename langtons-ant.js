(function () {
	let print = console.log.bind(console);

	// helper functions
	function isInBounds(x, y) {
	  return x < SCREENWIDTH && x >= 0 && y < SCREENHEIGHT && y >= 0;
	}
  
	function getRandomRange(min, max) {
	  // returns an integer between two numbers, including the last number
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min + 1) + min);
	}
  
	class Point {
	  constructor(x, y) {
		this.x = x;
		this.y = y;
	  }
	}
  
	let displacement = [
	  new Point(-1, 0),
	  new Point(0, -1),
	  new Point(1, 0),
	  new Point(0, 1)
	];
  
	let direction = {
	  left: 0,
	  up: 1,
	  right: 2,
	  down: 3
	};
  
	let tile = {
	  white: 0,
	  black: 1
	};
  
	class Ant {
	  constructor(x, y, initialDirection) {
		this.x = x;
		this.y = y;
		this.direction = initialDirection;
		this.isStuck = false;
	  }
  
	  rotate(newDirection) {
		switch (newDirection) {
		  case direction.left:
			this.direction--;
			break;
		  case direction.right:
			this.direction++;
			break;
		}
  
		if (this.direction < 0) {
		  this.direction = direction.down;
		} else if (this.direction > 3) {
		  this.direction = direction.left;
		}
	  }
  
	  forward() {
		let dx = 0;
		let dy = 0;
		switch (this.direction) {
		  case direction.left:
			dx = -1;
			dy = 0;
			break;
		  case direction.up:
			dx = 0;
			dy = -1;
			break;
		  case direction.right:
			dx = 1;
			dy = 0;
			break;
		  case direction.down:
			dx = 0;
			dy = 1;
			break;
		}
		if (isInBounds(this.x + dx, this.y + dy)) {
		  this.x += dx;
		  this.y += dy;
		} else {
		  this.isStuck = true;
		  stuckEntities.add(this);
		}
	  }
	}
  
	class Screen {
	  constructor(width, height) {
		this.buffer = new Buffer(width, height);
  
		this.canvas = document.getElementById("canvas");
		this.canvas.width = SCREENWIDTH * pixelSize;
		this.canvas.height = SCREENHEIGHT * pixelSize;
  
		this.ctx = this.canvas.getContext("2d");
	  }
  
	  highlight(cell) {
		this.ctx.save();
		  this.ctx.fillStyle = "red";
		  this.ctx.fillRect(
			cell.x * pixelSize,
			cell.y * pixelSize,
			pixelSize,
			pixelSize
		  );
		this.ctx.restore();
	  }
  
	  update() {
		for (let i = 0; i < ants.length; i++) {
		  let ant = ants[i];
		  if (ant.isStuck) {
			continue;
		  }
		  let currentTile = this.buffer.get(ant.x, ant.y);
		  // turn left or turn right?
		  if (currentTile == tile.black) {
			ant.rotate(direction.left);
			this.buffer.set(ant.x, ant.y, tile.white);
		  } else {
			ant.rotate(direction.right);
			this.buffer.set(ant.x, ant.y, tile.black);
		  }
		  ant.forward();
		}
	  }
  
	  render() {
		this.clear();
		for (let y = 0; y < SCREENHEIGHT; y++) {
		  for (let x = 0; x < SCREENWIDTH; x++) {
			if (this.buffer.get(x, y)) {
			  this.ctx.fillRect(
				x * pixelSize,
				y * pixelSize,
				pixelSize,
				pixelSize
			  );
			}
		  }
		}
  
		for (let i = 0; i < ants.length; i++) {
		  this.highlight(ants[i]);
		}
	  }
  
	  clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawGrid();
	  }
  
	  drawGrid() {
		this.ctx.beginPath();
		for (let x = 0; x <= this.canvas.width; x += pixelSize) {
		  this.ctx.moveTo(x, 0);
		  this.ctx.lineTo(x, this.canvas.height);
		}
		this.ctx.closePath();
		this.ctx.stroke();
  
		this.ctx.beginPath();
		for (let y = 0; y <= this.canvas.height; y += pixelSize) {
		  this.ctx.moveTo(0, y);
		  this.ctx.lineTo(this.canvas.width, y);
		}
		this.ctx.closePath();
		this.ctx.stroke();
	  }
  
	  tick() {
		this.update();
		this.render();
	  }
	}
  
	class Buffer {
	  constructor(width, height) {
		this.buffer = new Array(width * height).fill(tile.white);
	  }
  
	  set(x, y, val) {
		if (isInBounds(x, y)) {
		  this.buffer[y * SCREENWIDTH + x] = val;
		}
	  }
  
	  get(x, y) {
		return this.buffer[y * SCREENWIDTH + x];
	  }
	}
	  
	const SCREENWIDTH = 80;
	const SCREENHEIGHT = 80;
	const pixelSize = 6;

	let screen = new Screen(SCREENWIDTH, SCREENHEIGHT);
	let offSet = 29;
	let stuckEntities = new Set();
	let ants = [
	  new Ant(offSet, offSet, direction.down),
	  new Ant(offSet, SCREENHEIGHT - offSet, direction.right),
	  new Ant(SCREENWIDTH - offSet, offSet, direction.left),
	  new Ant(SCREENWIDTH - offSet, SCREENHEIGHT - offSet, direction.up)
	];
  
	let iteration = document.getElementById("iteration");
	let iter = 0;
	let fps = 60;

	document.getElementById("width").innerHTML = SCREENWIDTH;
	document.getElementById("height").innerHTML = SCREENHEIGHT;
  
	(function mainLoop() {
	  screen.tick();
	  if (stuckEntities.size < 4) {
		iteration.innerHTML = ++iter;
		setTimeout(function () {
		  requestAnimationFrame(mainLoop);
		}, 1000 / fps);
	  }
	})();
  })();
  