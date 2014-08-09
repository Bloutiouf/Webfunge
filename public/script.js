"use strict";

function WebfungeCanvas(options) {
	var that = this;
	
	this.options = options;
	this.running = true;
	this.startTime = Date.now();
	this.threads = [];
	
	this.$canvas = $('<canvas>');
	options.container.append(this.$canvas);
	
	this.$canvas.mousemove(function(e) {
		that.mouse = Math.round(e.pageX / that.$canvas.width() * that.width) + that.width * Math.round(e.pageY / that.$canvas.height() * that.height);
	});
}

WebfungeCanvas.prototype.changeSize = function() {
	if (!this.aspectRatio || !this.resolution || !this.threadCount)
		return;
	
	this.height = this.resolution;
	this.width = Math.round(this.aspectRatio * this.height);
	var blockHeight = this.height / this.threadCount;
	
	this.dataLength = this.width * blockHeight * 4;
	
	this.$canvas.attr('height', this.height);
	this.$canvas.attr('width', this.width);
	
	this.ctx = this.$canvas[0].getContext('2d');
	this.pixel = this.ctx.createImageData(this.width, this.height);
	
	var that = this;
	var codeMessage = ['code', this.code];
	while (this.threadCount > this.threads.length) {
		var thread = new Worker('thread.js');
		(function(index) {
			thread.addEventListener('message', function(e) {
				that.onMessage(index, e.data);
			}, false);
			thread.postMessage(['index', index]);
			if (that.code)
				thread.postMessage(codeMessage);
		})(this.threads.length);
		this.threads.push(thread);
	}
	
	while (this.threadCount < this.threads.length) {
		var thread = this.threads.pop(thread);
		thread.terminate();
	}
	
	var message = ['size', this.width, this.height, blockHeight];
	for (var i = 0, n = this.threads.length; i < n; ++i)
		this.threads[i].postMessage(message);
};

WebfungeCanvas.prototype.onRender = function() {
	--this.messages;
	if (!this.messages) {
		this.ctx.putImageData(this.pixel, 0, 0);
		
		this.options.stats.end();
		
		if (this.running)
			requestAnimationFrame(this.render.bind(this));
	}
};

WebfungeCanvas.prototype.onMessage = function(index, data) {
	switch (data[0]) {
		case 'debug':
			console.log(data[1]);
			break;
			
		case 'no':
			this.onRender();
			break;
			
		case 'render':
			if (data[1].length === this.dataLength && index < this.threads.length)
				this.pixel.data.set(data[1], index * this.dataLength);
			
			this.onRender();
			break;
	}
};

WebfungeCanvas.prototype.render = function() {
	this.options.stats.begin();
	
	var time = (Date.now() - this.startTime) / 1000;
	var message = ['render', time, this.mouse];
	
	this.messages = this.threads.length;
	for (var i = 0, n = this.threads.length; i < n; ++i)
		this.threads[i].postMessage(message);
};

WebfungeCanvas.prototype.setAspectRatio = function(aspectRatio) {
	this.aspectRatio = aspectRatio;
	this.changeSize();
};

WebfungeCanvas.prototype.setCode = function(code) {
	this.code = code;
	var message = ['code', code];
	for (var i = 0, n = this.threads.length; i < n; ++i)
		this.threads[i].postMessage(message);
};

WebfungeCanvas.prototype.setResolution = function(resolution) {
	this.resolution = resolution;
	this.changeSize();
};

WebfungeCanvas.prototype.setThreadCount = function(threadCount) {
	this.threadCount = threadCount;
	this.changeSize();
};

WebfungeCanvas.prototype.stop = function() {
	this.running = false;
	this.$canvas.remove();
	
	while (this.threads.length) {
		var thread = this.threads.pop(thread);
		thread.terminate();
	}
};

angular.module('Webfunge', [])

.controller('Layout', ['$http', '$sce', '$scope', function($http, $sce, $scope) {
	var $displayReference = $('#display-reference');
	var $editor = $('#editor');
	var $program = $('#program');
	var $reference = $('#reference');
	var $window = $(window);
	
	var $innerReference;
	
	var stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms
	
	$('#stats').change(function() {
		if (this.checked)
			document.body.appendChild(stats.domElement);
		else
			document.body.removeChild(stats.domElement);
	});
	
	$displayReference.change(function() {
		if (this.checked)
			$reference.show();
		else
			$reference.hide();
	});
	
	$http.get('/reference.html')
	.success(function(reference) {
		$scope.reference = $sce.trustAsHtml(reference);
		setTimeout(function() {
			$innerReference = $reference.children('div');
		}, 0);
	});
	
	$scope.shaders = [{
		name: 'Welcome',
		file: 'welcome.wf'
	}, {
		name: 'Spheres',
		file: 'spheres.wf'
	}];
	$scope.shader = $scope.shaders[0];
	
	var canvas = new WebfungeCanvas({
		container: $('#canvas'),
		stats: stats
	});
	
	$scope.changeResolution = function() {
		canvas.setResolution($scope.resolution);
	};
	
	$scope.changeShader = function() {
		$http.get('/shaders/' + $scope.shader.file)
		.success(function(code) {
			$program.val(code);
			canvas.setCode(code);
		});
	};
	
	$scope.changeThreadCount = function() {
		canvas.setThreadCount($scope.threadCount);
	};
	
	$scope.setCode = function() {
		canvas.setCode($program.val());
	};
	
	$scope.resolutions = [8, 16, 32, 48, 64, 96, 128, 192, 256];
	$scope.threadCounts = [1, 2, 4, 8, 16];
	
	$window.keypress(function(e) {
		if (e.which === 10 && e.ctrlKey && canvas) {
			canvas.setCode($program.val());
			e.preventDefault();
		}
		
		if (e.which === 32 && e.ctrlKey) {
			if ($displayReference.prop('checked')) {
				$displayReference.prop('checked', false);
				$displayReference.parent().removeClass('active');
			} else {
				$displayReference.prop('checked', true);
				$displayReference.parent().addClass('active');
			}
			$displayReference.change();
			e.preventDefault();
		}
	});
	
	$window.keydown(function(e) {
		if (e.keyCode === 9) {
			if ($editor.is(':hidden')) {
				$editor.show().focus();
				canvas.mouse = null;
			} else {
				$editor.hide();
			}
			e.preventDefault();
		}
	});

	$window.resize(function() {
		canvas.setAspectRatio($window.width() / $window.height());
	}).resize();

	$scope.$on('$destroy', function() {
		$program.off('keyup');
		$(window).off('keydown resize');
		rendering = false;
	});
	
	function positionFromCaret(caret, text) {
		var x = 0, y = 0;
		for (var i = 0; i < caret; ++i) {
			if (text[i] === '\n') {
				++y;
				x = 0;
			} else
				++x;
		}
		return [x, y];
	}
	
	var referenceWasDisplayed = false;
	var previousScrollTop;
	var temporaryTr;
	
	function showTemporaryReference(instruction) {
		if (!$innerReference)
			return;
		
		if (temporaryTr)
			temporaryTr.removeClass('temporary');
		else {
			referenceWasDisplayed = $reference.is(':visible');
			$reference.show();
			previousScrollTop = $innerReference.scrollTop();
		}
		
		var trs = $reference.find('tr');
		for (var i = 0, n = trs.length; i < n; ++i) {
			var tr = $(trs[i]);
			var trInstruction = tr.children().eq(1).text();
			var found = false;
			
			if (trInstruction.indexOf('-') === 1)
				found = (instruction >= trInstruction[0] && instruction <= trInstruction[2]);
			else
				found = (trInstruction === instruction);
			
			if (found) {
				tr.addClass('temporary');
				$innerReference.scrollTop($innerReference.scrollTop() + tr.position().top);
				temporaryTr = tr;
				break;
			}
		}
		
		if (i === n) {
			$reference.hide();
			temporaryTr = null;
		}
	}
	
	function hideTemporaryReference() {
		if (temporaryTr) {
			if (referenceWasDisplayed)
				$innerReference.scrollTop(previousScrollTop);
			else
				$reference.hide();
				
			temporaryTr.removeClass('temporary');
			temporaryTr = null;
		}
	}
	
	$program.on('blur focus keyup click', function() {
		var startCaret = $program[0].selectionStart;
		var endCaret = $program[0].selectionEnd;
		var code = $program.val();
		
		var startPosition = positionFromCaret(startCaret, code);
		var output = 'x: <strong>' + startPosition[0] + '</strong>, y: <strong>' + startPosition[1] + '</strong>';
		if (startCaret !== endCaret) {
			var endPosition = positionFromCaret(endCaret, code);
			output += ' &ndash; x: <strong>' + endPosition[0] + '</strong>, y: <strong>' + endPosition[1] + '</strong>';
			
			if (endCaret - startCaret === 1)
				showTemporaryReference(code[startCaret]);
		} else
			hideTemporaryReference();
		
		$('#caret').html(output);
	});
	
	$scope.resolution = 64;
	$scope.changeResolution();
	
	$scope.threadCount = 8;
	$scope.changeThreadCount();
	
	$program.focus();
	
	$scope.changeShader();
	
	canvas.render();
}]);
