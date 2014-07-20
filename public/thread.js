"use strict";

var registerCount = 16;
var slotsPerRegister = 8;
var stackSize = 256;
var steps = 10000;

var registers = new Float32Array(registerCount * slotsPerRegister);
var stack = new Float32Array(stackSize);

var blockBase;
var blockHeight;
var codeWidth;
var codeHeight;
var debug;
var height;
var mouse;
var output;
var space;
var threadIndex;
var time;
var width;

var calls;
var currentSteps;
var cursorX;
var cursorY;
var deltaX;
var deltaY;
var loadedSemantics;
var running;
var stack;
var stackTop;
var stringMode;

var currentInstruction;
var debugStack;
var tmpA, tmpB, tmpC, tmpD, tmpE, tmpF;
var tmpI, tmpIndex, tmpN;
/*
function popVector(stack, n) {
	return stack.splice(stack.length - n, n);
}
*/
var VSemantics = [
	function() { // A
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] += stack[stackTop + tmpI];
		--stackTop;
	},
	null, // B
	null, // c
	function() { // D
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpA = 0;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			tmpA += stack[tmpIndex + tmpI] * stack[stackTop + tmpI];
		stackTop -= tmpN;
		stack[stackTop] = tmpA;
	},
	null, // E
	null, // F
	null, // G
	null, // H
	function() { // I
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] = Math.min(stack[tmpIndex + tmpI], stack[stackTop + tmpI]);
		--stackTop;
	},
	function() { // J
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] = Math.max(stack[tmpIndex + tmpI], stack[stackTop + tmpI]);
		--stackTop;
	},
	function() { // K
		tmpN = stack[stackTop];
		tmpA = stack[stackTop-1];
		stackTop -= 2;
		tmpIndex = stackTop - tmpN + 1;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] *= tmpA;
	},
	function() { // L
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpA = 0;
		for (tmpI = 0; tmpI < tmpN; ++tmpI) {
			tmpB = stack[stackTop + tmpI];
			tmpA += tmpB * tmpB;
		}
		stack[stackTop] = Math.sqrt(tmpA);
	},
	function() { // M
		tmpN = stack[stackTop];
		tmpA = stack[stackTop-1]
		stackTop -= tmpN + 1;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] = stack[tmpIndex + tmpI] * (1 - tmpA) + stack[stackTop + tmpI] * tmpA;
		--stackTop;
	},
	function() { // N
		tmpN = stack[stackTop];
		tmpIndex = stackTop - tmpN;
		tmpA = 0;
		for (tmpI = 0; tmpI < tmpN; ++tmpI) {
			tmpB = stack[tmpIndex + tmpI];
			tmpA += tmpB * tmpB;
		}
		tmpA = Math.sqrt(tmpA);
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] /= tmpA;
		--stackTop;
	},
	function() { // O
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] -= stack[stackTop + tmpI] * Math.floor(stack[tmpIndex + tmpI] / stack[stackTop + tmpI]);
		--stackTop;
	},
	null, // P
	null, // Q
	null, // R
	function() { // S
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] -= stack[stackTop + tmpI];
		--stackTop;
	},
	null, // T
	null, // U
	function() { // V
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] /= stack[stackTop + tmpI];
		--stackTop;
	},
	function() { // W
		tmpN = stack[stackTop];
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[stackTop + tmpI] = stack[tmpIndex + tmpI];
		stackTop += tmpN - 1;
	},
	function() { // X
		tmpD = stack[stackTop - 2];
		tmpE = stack[stackTop - 1];
		tmpF = stack[stackTop    ];
		stackTop -= 3;
		tmpA = stack[stackTop - 2];
		tmpB = stack[stackTop - 1];
		tmpC = stack[stackTop    ];
		stack[stackTop - 2] = tmpB * tmpF - tmpC * tmpE;
		stack[stackTop - 1] = tmpC * tmpD - tmpA * tmpF;
		stack[stackTop    ] = tmpA * tmpE - tmpB * tmpD;
	},
	function() { // Y
		tmpN = stack[stackTop];
		stackTop -= tmpN;
		tmpIndex = stackTop - tmpN;
		for (tmpI = 0; tmpI < tmpN; ++tmpI)
			stack[tmpIndex + tmpI] *= stack[stackTop + tmpI];
		--stackTop;
	},
	null // Z
];

var mSemantics = [
	function() { // A
		stack[stackTop] = Math.abs(stack[stackTop]);
	},
	null, // B
	function() { // C
		stack[stackTop] = Math.cos(stack[stackTop]);
	},
	null, // D
	function() { // E
		stack[stackTop] = Math.exp(stack[stackTop]);
	},
	function() { // F
		stack[stackTop] = Math.floor(stack[stackTop]);
	},
	null, // G
	null, // H
	function() { // I
		--stackTop;
		stack[stackTop] = Math.min(stack[stackTop], stack[stackTop+1]);
	},
	function() { // J
		--stackTop;
		stack[stackTop] = Math.max(stack[stackTop], stack[stackTop+1]);
	},
	null, // K
	function() { // L
		stack[stackTop] = Math.log(stack[stackTop]);
	},
	function() { // M
		tmpA = stack[stackTop];
		stackTop -= 2;
		stack[stackTop] = stack[stackTop] * (1 - tmpA) + stack[stackTop+1] * tmpA;
	},
	null, // N
	null, // O
	function() { // P
		++stackTop;
		stack[stackTop] = Math.PI;
	},
	function() { // Q
		stack[stackTop] = Math.sqrt(stack[stackTop]);
	},
	function() { // R
		++stackTop;
		stack[stackTop] = Math.random();
	},
	function() { // S
		stack[stackTop] = Math.sin(stack[stackTop]);
	},
	null, // T
	null, // U
	null, // V
	function() { // W
		--stackTop;
		stack[stackTop] = Math.pow(stack[stackTop], stack[stackTop+1]);
	},
	null, // X
	null, // Y
	null // Z
];

function execute() {
	currentInstruction = space[cursorY * codeWidth + cursorX];
	if (stringMode) {
		if (currentInstruction === 34)
			stringMode = false;
		else
			stack.push(currentInstruction);
	} else
		switch (currentInstruction) {
			case 33: // ! 
				stack[stackTop] = !stack[stackTop];
				break;
				
			case 34: // "
				stringMode = true;
				break;
				
			case 35: // #
				move();
				break;
				
			case 36: // $
				--stackTop;
				break;
				
			case 37: // %
				var b = stack[stackTop];
				--stackTop;
				var a = stack[stackTop];
				//stack.push(a % b);
				stack[stackTop] = a - b * Math.floor(a / b);
				break;
				
			case 38: // &
				stack[stackTop] = registers[stack[stackTop] * slotsPerRegister];
				break;
				
			case 39: // '
				move();
				++stackTop;
				stack[stackTop] = space[cursorY * codeWidth + cursorX];
				break;
				
			case 40: // (
				tmpN = stack[stackTop];
				--stackTop;
				if (tmpN == 86)
					loadedSemantics.push(VSemantics);
				else if (tmpN == 109)
					loadedSemantics.push(mSemantics);
				else
					reflect();
				break;
				
			case 41: // )
				loadedSemantics.pop();
				break;
				
			case 42: // *
				--stackTop;
				stack[stackTop] *= stack[stackTop+1];
				break;
				
			case 43: // +
				--stackTop;
				stack[stackTop] += stack[stackTop+1];
				break;
				
			case 44: // ,
				if (debug)
					postMessage(['debug', stack[stackTop]]);
				--stackTop;
				break;
				
			case 45: // -
				--stackTop;
				stack[stackTop] -= stack[stackTop+1];
				break;
				
			case 46: // .
				registers[stack[stackTop] * slotsPerRegister] = stack[stackTop-1];
				stackTop -= 2;
				break;
				
			case 47: // /
				--stackTop;
				stack[stackTop] /= stack[stackTop+1];
				break;
				
			case 48: // 0
				++stackTop;
				stack[stackTop] = 0;
				break;
				
			case 49: // 1
				++stackTop;
				stack[stackTop] = 1;
				break;
				
			case 50: // 2
				++stackTop;
				stack[stackTop] = 2;
				break;
				
			case 51: // 3
				++stackTop;
				stack[stackTop] = 3;
				break;
				
			case 52: // 4
				++stackTop;
				stack[stackTop] = 4;
				break;
				
			case 53: // 5
				++stackTop;
				stack[stackTop] = 5;
				break;
				
			case 54: // 6
				++stackTop;
				stack[stackTop] = 6;
				break;
				
			case 55: // 7
				++stackTop;
				stack[stackTop] = 7;
				break;
				
			case 56: // 8
				++stackTop;
				stack[stackTop] = 8;
				break;
				
			case 57: // 9
				++stackTop;
				stack[stackTop] = 9;
				break;
				
			case 58: // :
				++stackTop;
				stack[stackTop] = stack[stackTop-1];
				break;
				
			case 59: // ;
				do {
					move();
				} while (space[cursorY * codeWidth + cursorX] !== 59);
				break;
				
			case 60: // <
				deltaX = -1;
				deltaY = 0;
				break;
				
			case 61: // =
				cursorX = stack[stackTop-1] - deltaX;
				cursorY = stack[stackTop] - deltaY;
				stackTop -= 2;
				break;
				
			case 62: // >
				deltaX = 1;
				deltaY = 0;
				break;
				
			case 63: // ?
				tmpN = Math.random();
				if (tmpN < 0.5) {
					deltaX = 0;
					deltaY = (tmpN < 0.25) ? 1 : -1;
				} else {
					deltaY = 0;
					deltaX = (tmpN < 0.75) ? 1 : -1;
				}
				break;
				
			case 64: // @
				running = false;
				break;
				
			case 91: // [
				tmpN = deltaX;
				deltaX = deltaY;
				deltaY = -tmpN;
				break;
				
			case 92: // \ 
				tmpN = stack[stackTop];
				stack[stackTop] = stack[stackTop-1];
				stack[stackTop-1] = tmpN;
				break;
				
			case 93: // ]
				tmpN = deltaX;
				deltaX = -deltaY;
				deltaY = tmpN;
				break;
				
			case 94: // ^
				deltaX = 0;
				deltaY = -1;
				break;
				
			case 95: // _
				deltaX = stack[stackTop] ? -1 : 1;
				deltaY = 0;
				--stackTop;
				break;
				
			case 96: // `
				--stackTop;
				stack[stackTop] = (stack[stackTop] > stack[stackTop+1] ? 1 : 0);
				break;
				
			case 97: // a
				++stackTop;
				stack[stackTop] = 10;
				break;
				
			case 98: // b
				++stackTop;
				stack[stackTop] = 11;
				break;
				
			case 99: // c
				++stackTop;
				stack[stackTop] = 12;
				break;
				
			case 100: // d
				++stackTop;
				stack[stackTop] = 13;
				break;
				
			case 101: // e
				++stackTop;
				stack[stackTop] = 14;
				break;
				
			case 102: // f
				++stackTop;
				stack[stackTop] = 15;
				break;
				
			case 103: // g no offset
				tmpB = stack[stackTop];
				--stackTop;
				tmpA = stack[stackTop];
				stack[stackTop] = (tmpA >= 0 && tmpA < codeWidth && tmpB >= 0 && tmpB < codeHeight) ? space[tmpB * codeWidth + tmpA] : 0;
				break;
				
			// no h Go High/98/3D
				
			case 105: // i
				tmpN = stack[stackTop];
				tmpA = stack[stackTop-1] * slotsPerRegister;
				tmpIndex = stackTop - 1;
				for (tmpI = 0; tmpI < tmpN; ++tmpI)
					stack[tmpIndex + tmpI] = registers[tmpA + tmpI];
				stackTop += tmpN - 2;
				break;
				
			case 106: // j
				tmpN = stack[stackTop];
				--stackTop;
				while (tmpN > 0) {
					move();
					--tmpN;
				}
				break;
				
			case 107: // k
				tmpN = stack[stackTop];
				--stackTop;
				move();
				while (tmpN > 0) {
					execute();
					--tmpN;
				}
				break;
				
			case 108: // l
				cursorX -= deltaY;
				cursorY += deltaX;
				wrap();
				break;
				
			// no m High-Low If/98/3D
				
			case 110: // n
				stack[stackTop] = -stack[stackTop];
				break;
				
			case 111: // o
				tmpN = stack[stackTop];
				tmpA = stack[stackTop-1] * slotsPerRegister;
				tmpIndex = stackTop - tmpN - 1;
				for (tmpI = 0; tmpI < tmpN; ++tmpI)
					registers[tmpA + tmpI] = stack[tmpIndex + tmpI];
				stackTop = tmpIndex - 1;
				break;
				
			case 112: // p
				tmpN = stack[stackTop];
				--stackTop;
				tmpIndex = stack[stackTop];
				if (tmpIndex < 0)
					tmpIndex = stackTop + 2 + tmpIndex;
				for (tmpI = 0; tmpI < tmpN; ++tmpI)
					stack[stackTop + tmpI] = stack[tmpIndex + tmpI];
				stackTop += tmpN - 1;
				break;
				
			case 113: // q
				if (debug) {
					debugStack = new Float32Array(stack.subarray(0, stackTop + 1));
					postMessage(['debug', debugStack], [debugStack.buffer]);
				}
				break;
				
			case 114: // r
				reflect();
				break;
				
			case 115: // s
				tmpN = stack[stackTop];
				--stackTop;
				tmpIndex = stack[stackTop];
				if (tmpIndex < 0)
					tmpIndex = stackTop + 2 + tmpIndex;
				for (tmpI = 0; tmpI < tmpN; ++tmpI)
					stack[tmpIndex + tmpI] = stack[stackTop - tmpN + tmpI];
				stackTop -= tmpN + 1;
				break;
				
			case 116: // t
				++stackTop;
				stack[stackTop] = stackTop - 1;
				break;
				
			case 117: // u
				wrap();
				break;
				
			case 118: // v
				deltaX = 0;
				deltaY = 1;
				break;
				
			case 119: // w
				tmpB = stack[stackTop];
				tmpA = stack[stackTop-1];
				stackTop -= 2;
				if (tmpA > tmpB) {
					tmpN = deltaX;
					deltaX = -deltaY;
					deltaY = tmpN;
				} else if (tmpA < tmpB) {
					tmpN = deltaX;
					deltaX = deltaY;
					deltaY = -tmpN;
				}
				break;
				
			case 120: // x
				deltaY = stack[stackTop];
				deltaX = stack[stackTop-1];
				stackTop -= 2;
				break;
				
			case 121: // y
				tmpI = stack[stackTop];
				if (tmpI < 0)
					tmpI = stackTop + 1 + tmpI;
				stack[stackTop] = stack[tmpI];
				break;
				
			case 122: // z
				tmpI = stack[stackTop];
				if (tmpI < 0)
					tmpI = stackTop + 1 + tmpI;
				stack[tmpI] = stack[stackTop-1];
				stackTop -= 2;
				break;
				
			case 123: // {
				tmpB = stack[stackTop];
				tmpA = stack[stackTop-1];
				stackTop -= 2;
				calls.push({
					x: cursorX,
					y: cursorY,
					dx: deltaX,
					dy: deltaY
				});
				cursorX = tmpA - 1;
				cursorY = tmpB;
				deltaX = 1;
				deltaY = 0;
				break;
				
			case 124: // |
				deltaY = stack[stackTop] ? -1 : 1;
				deltaX = 0;
				--stackTop;
				break;
				
			case 125: // }
				var call = calls.pop();
				cursorX = call.x;
				cursorY = call.y;
				deltaX = call.dx;
				deltaY = call.dy;
				break;
				
			// case '~':
				
			default: // A-Z
				if (currentInstruction >= 65 && currentInstruction <= 90) {
					for (var i = loadedSemantics.length - 1; i >= 0; --i) {
						var instruction = loadedSemantics[i][currentInstruction - 65];
						if (instruction && instruction() !== false)
							break;
					}
					if (i < 0) {
						reflect();
					}
				}
				break;
		}
}

function getColor(x, y, offset) {
	calls = [];
	currentSteps = steps;
	cursorX = 0;
	cursorY = 0;
	deltaX = 1;
	deltaY = 0;
	loadedSemantics = [mSemantics];
	running = true;
	stack[0] = x;
	stack[1] = y;
	stack[2] = width;
	stack[3] = height;
	stack[4] = time;
	stackTop = 4;
	stringMode = false;
	
	debug = (x + y * width === mouse);
	
	while (running && --currentSteps) {
		execute();
		move();
	}
	
	output[offset    ] = Math.floor((stack[stackTop - 2] || 0) * 255);
	output[offset + 1] = Math.floor((stack[stackTop - 1] || 0) * 255);
	output[offset + 2] = Math.floor((stack[stackTop    ] || 0) * 255);
	output[offset + 3] = 256;
}

function move() {
	cursorX += deltaX;
	cursorY += deltaY;
	
	if (cursorX < 0 || cursorX >= codeWidth || cursorY < 0 || cursorY >= codeHeight) {
		cursorX -= deltaX;
		cursorY -= deltaY;
		wrap();
		cursorX += deltaX;
		cursorY += deltaY;
	}
}

function reflect() {
	deltaX = -deltaX;
	deltaY = -deltaY;
}

function wrap() {
	while (cursorX >= 0 && cursorX < codeWidth && cursorY >= 0 && cursorY < codeHeight) {
		cursorX -= deltaX;
		cursorY -= deltaY;
	}
}

addEventListener('message', function(e) {
	var data = e.data;
	switch (data[0]) {
		case 'code':
			var code = data[1].split(/\r?\n/);
			codeHeight = code.length;
			codeWidth = code[0].length;
			for (var i = 1; i < codeHeight; ++i) {
				if (code[i].length > codeWidth)
					codeWidth = code[i].length;
			}
			
			space = new Uint8Array(codeWidth * codeHeight);
			var offset = 0;
			for (var y = 0; y < codeHeight; ++y) {
				var line = code[y];
				for (var x = 0; x < codeWidth; ++x) {
					space[offset] = line.charCodeAt(x) || 0;
					if (space[offset] === 32)
						space[offset] = 0;
					++offset;
				}
			}
			break;
			
		case 'index':
			threadIndex = data[1];
			break;
		
		case 'render':
			if (!space)
				return postMessage(['no']);
			
			time = data[1];
			mouse = data[2];
			
			output = new Uint8ClampedArray(width * blockHeight * 4);
			var offset = 0, y, x;
			for (y = 0; y < blockHeight; ++y)
				for (x = 0; x < width; ++x) {
					getColor(x, y + blockBase, offset);
					offset += 4;
				}
			postMessage(['render', output], [output.buffer]);
			break;
		
		case 'size':
			width = data[1];
			height = data[2];
			blockHeight = data[3];
			
			blockBase = blockHeight * threadIndex;
			break;
	}
}, false);