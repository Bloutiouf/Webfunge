"use strict";

function WebfungeCanvas(options) {
	var that = this;
	
	this.running = true;
	
	var resolution = options.resolution;
	var aspectRatio = options.aspectRatio;
	var blocHeight = resolution / options.threadCount;
	
	this.$canvas = $('<canvas>');
	this.$canvas.attr('height', resolution);
	this.$canvas.attr('width', resolution);
	
	options.container.append(this.$canvas);
	
	var ctx = this.$canvas[0].getContext('2d');
	var pixel = ctx.createImageData(resolution, resolution);
	
	var messages;
	
	var startTime = Date.now();
	function render() {
		options.stats.begin();
		
		var time = (Date.now() - startTime) / 1000;
		
		messages = that.threads.length;
		for (var i = 0; i < messages; ++i)
			that.threads[i].postMessage(['render', time, resolution, aspectRatio, blocHeight, i]);
	}
	
	function onMessage(index, data) {
		pixel.data.set(data, resolution * blocHeight * index * 4);
		
		--messages;
		if (!messages) {
			ctx.putImageData(pixel, 0, 0);
			
			options.stats.end();
			
			if (that.running)
				requestAnimationFrame(render);
			else
				that.threads = null;
		}
	}
	
	this.threads = [];
	var message = ['code', options.code];
	for (var i = 0, n = options.threadCount; i < n; ++i) {
		var thread = new Worker('thread.js');
		thread.addEventListener('message', (function(index) {
			return function(e) {
				onMessage(index, e.data);
			};
		})(this.threads.length), false);
		thread.postMessage(message);
		this.threads.push(thread);
	}
	
	render();
}

WebfungeCanvas.prototype.setCode = function(code) {
	var message = ['code', code];
	for (var i = 0, n = this.threads.length; i < n; ++i)
		this.threads[i].postMessage(message);
};

WebfungeCanvas.prototype.stop = function() {
	this.running = false;
	this.$canvas.remove();
};

angular.module('Webfunge', [])

.controller('Layout', ['$http', '$scope', function($http, $scope) {
	var stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms
	
	$('#stats').change(function() {
		if (this.checked)
			document.body.appendChild(stats.domElement);
		else
			document.body.removeChild(stats.domElement);
	});
	
	$scope.shaders = [{
		name: 'Instructions',
		file: 'instructions.wf'
	}, {
		name: 'Spheres',
		file: 'spheres.wf'
	}];
	$scope.shader = $scope.shaders[0];
	
	var canvas;
	
	function createCanvas() {
		$scope.options.aspectRatio = $(window).width() / $(window).height();
		$scope.options.code = $('#program').val();
		canvas = new WebfungeCanvas($scope.options);
	}
	
	function destroyCanvas() {
		if (canvas) {
			canvas.stop();
			canvas = null;
			return true;
		}
	}
	
	$scope.changeShader = function() {
		destroyCanvas();
		$http.get('shaders/' + $scope.shader.file)
		.success(function(code) {
			$('#program').val(code);
			createCanvas();
		});
	};
	
	$scope.changeCanvas = function() {
		return destroyCanvas() && createCanvas();
	}
	
	$scope.setCode = function() {
		$scope.options.code = $('#program').val();
		if (canvas)
			canvas.setCode($scope.options.code);
	};
	
	$scope.resolutions = [8, 16, 32, 48, 64];
	
	$scope.threadCounts = [1, 2, 4, 8, 16];
	
	$scope.options = {
		container: $('#canvas'),
		stats: stats,
		resolution: 32,
		threadCount: 8
	};
	
	$scope.changeShader();
	
	$('#program').keyup(function(e) {
		if (e.keyCode === 13 && e.ctrlKey && canvas) {
			canvas.setCode($(this).val());
			e.preventDefault();
		}
	});
	
	$('#program').focus();
	
	$(window).keydown(function(e) {
		if (e.keyCode === 9) {
			if ($('#editor').is(':hidden'))
				$('#editor').show().focus();
			else {
				$('#editor').hide();
			}
			e.preventDefault();
		}
	});

	$(window).resize(function() {
		$scope.changeCanvas();
	});

	$scope.$on('$destroy', function() {
		$('#program').off('keyup');
		$(window).off('keydown resize');
		rendering = false;
	});
}]);
