"use strict";

function popVector(stack, n) {
	return stack.splice(stack.length - n, n);
}

var semantics = {
	m: {
		A: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.abs(stack[i]);
		},
		C: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.cos(stack[i]);
		},
		E: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.exp(stack[i]);
		},
		I: function(stack) {
			var b = stack.pop();
			var a = stack.pop();
			stack.push(Math.min(a, b));
		},
		J: function(stack) {
			var b = stack.pop();
			var a = stack.pop();
			stack.push(Math.max(a, b));
		},
		L: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.log(stack[i]);
		},
		P: function(stack) {
			stack.push(Math.PI);
		},
		Q: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.sqrt(stack[i]);
		},
		S: function(stack) {
			var i = stack.length - 1;
			stack[i] = Math.sin(stack[i]);
		},
		W: function(stack) {
			var e = stack.pop();
			var v = stack.pop();
			stack.push(Math.pow(v, e));
		}
	},
	V: {
		A: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] += b[i];
		},
		D: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var a = popVector(stack, n);
			var result = 0;
			for (var i = 0; i < n; ++i)
				result += a[i] * b[i];
			stack.push(result);
		},
		I: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] = Math.min(stack[base + i], b[i]);
		},
		J: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] = Math.max(stack[base + i], b[i]);
		},
		K: function(stack) {
			var n = stack.pop();
			var k = stack.pop();
			for (var i = 1; i <= n; ++i)
				stack[stack.length - i] *= k;
		},
		L: function(stack) {
			var n = stack.pop();
			var length = 0;
			for (var i = 0; i < n; ++i) {
				var v = stack.pop();
				length += v * v;
			}
			length = Math.sqrt(length);
			stack.push(length);
		},
		M: function(stack) {
			var n = stack.pop();
			var t = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] = stack[base + i] * (1 - t) + b[i] * t;
		},
		N: function(stack) {
			var n = stack.pop();
			var length = 0;
			for (var i = 1; i <= n; ++i) {
				var v = stack[stack.length - i];
				length += v * v;
			}
			length = Math.sqrt(length);
			for (var i = 1; i <= n; ++i) {
				stack[stack.length - i] = stack[stack.length - i] / length;
			}
		},
		O: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] -= b[i] * Math.floor(stack[base + i] / b[i]);
		},
		S: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] -= b[i];
		},
		// T
		V: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] /= b[i];
		},
		W: function(stack) {
			var n = stack.pop();
			var v = stack.slice(-n);
			stack.push.apply(stack, v);
		},
		X: function(stack) {
			var b = popVector(stack, 3);
			var a = popVector(stack, 3);
			stack.push(a[1] * b[2] - a[2] * b[1]);
			stack.push(a[2] * b[0] - a[0] * b[2]);
			stack.push(a[0] * b[1] - a[1] * b[0]);
		},
		Y: function(stack) {
			var n = stack.pop();
			var b = popVector(stack, n);
			var base = stack.length - n;
			for (var i = 0; i < n; ++i)
				stack[base + i] *= b[i];
		}
	}
};

function Program() {
	this.code = ['@'];
}

Program.prototype.setBlock = function(time, resolution, aspectRatio, array) {
	this.time = time;
	this.resolution = resolution;
	this.aspectRatio = aspectRatio;
	this.array = array;
};

Program.prototype.setCode = function(code) {
	this.code = code.split(/\r?\n/);
};

Program.prototype.getColor = function(x, y, offset) {
	var cursorX = 0;
	var cursorY = 0;
	var deltaX = 1;
	var deltaY = 0;
	var stack = [x, y, this.time, this.resolution, this.aspectRatio];
	var files = {};
	var loadedSemantics = [];
	var calls = [];
	var running = true;
	var stringMode = false;
	
	var steps = 10000;
	
	var that = this;
	
	function reflect() {
		deltaX = -deltaX;
		deltaY = -deltaY;
	}
	
	function execute() {
		var c = that.code.length > cursorY && that.code[cursorY][cursorX] || ' ';
		if (stringMode) {
			if (c === '"')
				stringMode = false;
			else
				stack.push(c);
		} else
			switch (c) {
				case ' ':
					break;
					
				case '!':
					var b = stack.pop();
					if (b)
						stack.push(0);
					else
						stack.push(1);
					break;
					
				case '"':
					stringMode = true;
					break;
					
				case '#':
					cursorX += deltaX;
					cursorY += deltaY;
					break;
					
				case '$':
					stack.pop();
					break;
					
				case '%':
					var b = stack.pop();
					var a = stack.pop();
					//stack.push(a % b);
					stack.push(a - b * Math.floor(a / b));
					break;
					
				case '&':
					var s = stack.pop();
					stack.push(files[s]);
					break;
					
				case '\'':
					cursorX += deltaX;
					cursorY += deltaY;
					stack.push(that.code[cursorY][cursorX]);
					break;
					
				case '(':
					var s = stack.pop();
					var sem = semantics[s];
					if (sem)
						loadedSemantics.push(sem);
					else
						reflect();
					break;
					
				case ')':
					loadedSemantics.pop();
					break;
					
				case '*':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a * b);
					break;
					
				case '+':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a + b);
					break;
					
				// no , Output Character
					
				case '-':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a - b);
					break;
					
				case '.':
					var s = stack.pop();
					var a = stack.pop();
					files[s] = a;
					break;
					
				case '/':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a / b);
					break;
					
				case '0':
					stack.push(0);
					break;
					
				case '1':
					stack.push(1);
					break;
					
				case '2':
					stack.push(2);
					break;
					
				case '3':
					stack.push(3);
					break;
					
				case '4':
					stack.push(4);
					break;
					
				case '5':
					stack.push(5);
					break;
					
				case '6':
					stack.push(6);
					break;
					
				case '7':
					stack.push(7);
					break;
					
				case '8':
					stack.push(8);
					break;
					
				case '9':
					stack.push(9);
					break;
					
				case ':':
					stack.push(stack[stack.length - 1]);
					break;
					
				case ';':
					do {
						cursorX += deltaX;
						cursorY += deltaY;
					} while (that.code[cursorY][cursorX] !== ';');
					break;
					
				case '?':
					var r = Math.random();
					if (r < 0.5) {
						deltaX = 0;
						deltaY = (r < 0.25) ? 1 : -1;
					} else {
						deltaY = 0;
						deltaX = (r < 0.75) ? 1 : -1;
					}
					break;
					
				case '@':
					running = false;
					break;
					
				case '<':
					deltaX = -1;
					deltaY = 0;
					break;
					
				case '=':
					var s = stack.pop();
					stack.push(eval(s));
					break;
					
				case '>':
					deltaX = 1;
					deltaY = 0;
					break;
					
				case '[':
					var dx = deltaX;
					deltaX = deltaY;
					deltaY = -dx;
					break;
					
				case '\\':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(b);
					stack.push(a);
					break;
					
				case ']':
					var dx = deltaX;
					deltaX = -deltaY;
					deltaY = dx;
					break;
					
				case '^':
					deltaX = 0;
					deltaY = -1;
					break;
					
				case '_':
					var b = stack.pop();
					deltaX = b ? -1 : 1;
					deltaY = 0;
					break;
					
				case '`':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a > b ? 1 : 0);
					break;
					
				case 'a':
					stack.push(10);
					break;
					
				case 'b':
					stack.push(11);
					break;
					
				case 'c':
					stack.push(12);
					break;
					
				case 'd':
					stack.push(13);
					break;
					
				case 'e':
					stack.push(14);
					break;
					
				case 'f':
					stack.push(15);
					break;
					
				case 'g': // no offset
					var y = stack.pop();
					var x = stack.pop();
					if (that.code.length > y)
						stack.push(that.code[y][x] || ' ');
					else
						stack.push(' ');
					break;
					
				// no h Go High/98/3D
					
				case 'i':
					var s = stack.pop();
					stack.push.apply(stack, files[s]);
					break;
					
				case 'j':
					var n = stack.pop();
					cursorX += n * deltaX;
					cursorY += n * deltaY;
					break;
					
				case 'k':
					var n = stack.pop();
					cursorX += deltaX;
					cursorY += deltaY;
					for (var i = 0; i < n; ++i)
						execute();
					break;
					
				// no l Go Low/98/3D
					
				// no m High-Low If/98/3D
					
				case 'n':
					stack = [];
					break;
					
				case 'o':
					var s = stack.pop();
					var n = stack.pop();
					files[s] = stack.splice(stack.length - n, n);
					break;
					
				case 'p':
					var n = stack.pop();
					var i = stack.pop();
					if (i < 0)
						i = stack.length + i;
					for (var j = i; j < i + n; ++j)
						stack.push(stack[j]);
					break;
					
				case 'q':
					running = false;
					break;
					
				case 'r':
					reflect();
					break;
					
				case 's':
					var n = stack.pop();
					var i = stack.pop();
					if (i < 0)
						i = stack.length + i;
					var v = popVector(stack, n);
					v.unshift(n);
					v.unshift(i);
					stack.splice.apply(stack, v);
					break;
					
				// no t Split/98/c
					
				// no u Stack Under Stack/98
					
				case 'v':
					deltaX = 0;
					deltaY = 1;
					break;
					
				case 'w':
					var b = stack.pop();
					var a = stack.pop();
					if (a > b) {
						var dx = deltaX;
						deltaX = -deltaY;
						deltaY = dx;
					} else if (a < b) {
						var dx = deltaX;
						deltaX = deltaY;
						deltaY = -dx;
					}
					break;
					
				case 'x':
					deltaY = stack.pop();
					deltaX = stack.pop();
					break;
					
				case 'y':
					var i = stack.pop();
					if (i < 0)
						i = stack.length + i;
					stack.push(stack[i]);
					break;
					
				case 'z':
					var i = stack.pop();
					if (i < 0)
						i = stack.length + i;
					var v = stack.pop();
					stack[i] = v;
					break;
					
				case '{':
					var n = stack.pop();
					var y = stack.pop();
					var x = stack.pop();
					var v = popVector(stack, n);
					calls.push({
						x: cursorX,
						y: cursorY,
						dx: deltaX,
						dy: deltaY,
						s: stack
					});
					cursorX = x - 1;
					cursorY = y;
					deltaX = 1;
					deltaY = 0;
					stack = v;
					break;
					
				case '|':
					var b = stack.pop();
					deltaY = b ? -1 : 1;
					deltaX = 0;
					break;
					
				case '}':
					var n = stack.pop();
					var v = popVector(stack, n);
					var call = calls.pop();
					cursorX = call.x;
					cursorY = call.y;
					deltaX = call.dx;
					deltaY = call.dy;
					stack = call.s.concat(v);
					break;
					
				// no ~ Input Character
					
				default: // A-Z
					var ascii = c.charCodeAt(0);
					if (ascii >= 65 && ascii <= 90) {
						for (var i = loadedSemantics.length - 1; i >= 0; --i) {
							var instruction = loadedSemantics[i][c];
							if (instruction && instruction(stack) !== false)
								break;
						}
						if (i < 0) {
							reflect()
						}
					}
					break;
			}
	}
	
	while (running && --steps) {
		execute();
		
		cursorX += deltaX;
		cursorY += deltaY;
		
		// wrap
	}
	
	this.array[offset    ] = Math.floor((stack[stack.length - 3] || 0) * 255);
	this.array[offset + 1] = Math.floor((stack[stack.length - 2] || 0) * 255);
	this.array[offset + 2] = Math.floor((stack[stack.length - 1] || 0) * 255);
	this.array[offset + 3] = 256;
};

Program.prototype.registerSemantics = function(code) {
	
};

var program = new Program();

addEventListener('message', function(e) {
	var data = e.data;
	switch (data[0]) {
		case 'code':
			program.setCode(data[1]);
			break;
			
		case 'render':
			var time = data[1];
			var resolution = data[2];
			var aspectRatio = data[3];
			var blockHeight = data[4];
			var index = data[5];
			var blockBase = blockHeight * index;
			var array = new Uint8ClampedArray(resolution * blockHeight * 4);
			program.setBlock(time, resolution, aspectRatio, array);
			var offset = 0;
			for (var y = 0; y < blockHeight; ++y)
				for (var x = 0; x < resolution; ++x) {
					program.getColor(x, y + blockBase, offset);
					offset += 4;
				}
			postMessage(array, [array.buffer]);
			break;
	}
}, false);