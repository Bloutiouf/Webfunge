"use strict";

function Program() {
	this.code = [];
	this.mathSemantics = function(command, stack) {
		switch (command) {
			case 'A':
				var v = stack.pop();
				stack.push(Math.abs(v));
				break;
			
			case 'C':
				var v = stack.pop();
				stack.push(Math.cos(v));
				break;
			
			case 'P':
				var e = stack.pop();
				var v = stack.pop();
				stack.push(Math.pow(v, e));
				break;
			
			case 'Q':
				var v = stack.pop();
				stack.push(Math.sqrt(v));
				break;
			
			case 'S':
				var v = stack.pop();
				stack.push(Math.sin(v));
				break;
			
			default:
				return false;
		}
		return true;
	};
}

Program.prototype.setBlock = function(width, height, time, array) {
	this.width = width;
	this.height = height;
	this.time = time;
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
	var stack = [x, y, this.width, this.height, this.time];
	var loadedSemantics = [this.mathSemantics];
	var running = true;
	var stringMode = false;
	
	while (running) {
		var c = this.code.length > cursorY && this.code[cursorY][cursorX] || ' ';
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
					stack.push(a % b);
					break;
					
				case '\'':
					cursorX += deltaX;
					cursorY += deltaY;
					stack.push(this.code[cursorY][cursorX]);
					break;
					
				case '(':
				case ')':
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
					
				case '-':
					var b = stack.pop();
					var a = stack.pop();
					stack.push(a - b);
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
					} while (this.code[cursorY][cursorX] !== ';');
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
					
				case 'g':
					var y = stack.pop();
					var x = stack.pop();
					if (this.code.length > y)
						stack.push(this.code[y][x] || ' ');
					else
						stack.push(' ');
					break;
					
				case 'j':
					var n = stack.pop();
					cursorX += n * deltaX;
					cursorY += n * deltaY;
					break;
					
				case 'n':
					stack = [];
					break;
					
				// no p, changing code is not allowed
					
				case 'q':
					running = false;
					break;
					
				case 'r':
					deltaX = -deltaX;
					deltaY = -deltaY;
					break;
					
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
					if (i >= 0)
						stack.push(stack[i]);
					else
						stack.push(stack[stack.length + i]);
					break;
					
				case 'z':
					var v = stack.pop();
					var i = stack.pop();
					stack[i] = v;
					break;
					
				case '|':
					var b = stack.pop();
					deltaY = b ? -1 : 1;
					deltaX = 0;
					break;
					
				default:
					var ascii = this.code[cursorY].charCodeAt(cursorX);
					if (ascii >= 65 && ascii <= 90) {
						for (var i = loadedSemantics.length - 1; i >= 0; --i)
							if (loadedSemantics[i](c, stack))
								break;
						if (i < 0) {
							deltaX = -deltaX;
							deltaY = -deltaY;
						}
					}
					break;
			}
		
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
			var width = data[2];
			var height = data[3];
			var blockHeight = data[4];
			var index = data[5];
			var array = new Uint8ClampedArray(width * blockHeight * 4);
			program.setBlock(width, height, time, array);
			var offset = 0;
			for (var y = 0; y < blockHeight; ++y)
				for (var x = 0; x < width; ++x) {
					program.getColor(x, y + blockHeight * index, offset);
					offset += 4;
				}
			postMessage(array, [array.buffer]);
			break;
	}
}, false);