"use strict";

$(function() {
	function ThreadPool(ctx, onRendered) {
		this.ctx = ctx;
		this.threads = [];
		this.code = '';
		
		var that = this;
		this.onMessage = function(index, data) {
			that.pixel.data.set(data, that.width * that.blocHeight * index * 4);
			
			--that.messages;
			if (!that.messages) {
				ctx.putImageData(that.pixel, 0, 0);
				onRendered();
			}
		}
	}

	ThreadPool.prototype.render = function(time) {
		var n = this.messages = this.threads.length;
		for (var i = 0; i < n; ++i)
			this.threads[i].postMessage(['render', time, this.width, this.height, this.blocHeight, i]);
	};

	ThreadPool.prototype.setCode = function(code) {
		this.code = code;
		var message = ['code', code];
		for (var i = 0, n = this.threads.length; i < n; ++i)
			this.threads[i].postMessage(message);
	};

	ThreadPool.prototype.setSize = function(size, width, height) {
		if (size <= this.threads.length)
			this.threads.splice(size, this.threads.length - size);
		else while (size > this.threads.length) {
			var thread = new Worker('thread.js');
			thread.addEventListener('message', (function(index, onMessage) {
				return function(e) {
					onMessage(index, e.data);
				};
			})(this.threads.length, this.onMessage), false);
			this.threads.push(thread);
		}
		
		this.width = width;
		this.height = height;
		this.blocHeight = height / this.threads.length;
		this.pixel = this.ctx.createImageData(width, this.height);
	};

	var stats = new Stats();
	stats.setMode(1); // 0: fps, 1: ms
	document.body.appendChild(stats.domElement);
	
	var renderer = $('#renderer');
	var height = Number(renderer.attr('height'));
	var width = Number(renderer.attr('width'));
	
	var pool = new ThreadPool(renderer[0].getContext('2d'), function() {
		stats.end();
		requestAnimationFrame(render);
	});
	
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
	
	$('#program').keyup(function(e) {
		if (e.keyCode === 13 && e.ctrlKey) {
			pool.setCode($(this).val());
			e.preventDefault();
		}
	});
	
	$('#program').focus();
	pool.setSize(8, width, height);
	pool.setCode($('#program').val());
	
	var startTime = Date.now();
	function render() {
		stats.begin();
		
		var time = (Date.now() - startTime) / 1000;
		pool.render(time);
	}
	render();
	
});