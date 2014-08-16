var express = require('express'),
	fs = require('fs'),
	marked = require('marked'),
	markedToc = require('marked-toc')
	nib = require('nib'),
	path = require('path'),
	stylus = require('stylus');

var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
	var name = 'reference-' + text.toLowerCase().replace(/[^\w]+/g, '-');
	while (name[name.length - 1] === '-')
		name = name.slice(0, -1);
	
	return '<h' + level + '><a name="' + name + '" href="#' + name + '">' + text + '</a></h' + level + '>';
};

marked.setOptions({
	renderer: renderer
});

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(stylus.middleware({
	dest: path.join(__dirname, 'generated'),
	src: __dirname + '/public',
	compile: function(str, path) {
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.use(nib())
			.import('nib');
	}
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'generated')));

app.use('/shaders/welcome.wf', function(req, res) {
	res.sendFile(path.join(__dirname, 'readme.md'));
});

app.use('/reference.html', function(req, res) {
	fs.readFile(path.join(__dirname, 'reference.md'), {
		encoding: 'utf8'
	}, function(err, md) {
		if (err)
			return res.send(404);
		
		var toc = markedToc(md, {
			firsth1: true,
			template: '<%= depth %><%= bullet %>[<%= heading %>](#reference-<%= url %>)\n'
		});
		var htmlToc = marked(toc);
		var html = marked(md);
		
		var output = '<div>' + html + '</div>' + htmlToc;
		res.send(output);
		
		if (app.get('env') !== 'development')
			fs.writeFileSync(path.join(__dirname, 'generated', 'reference.html'), output);
	});
});

app.use(function(req, res) {
	res.render('index');
});

if (require.main === module)
	app.listen(app.get('port'), function(){
		console.log('Webfunge server listening on port %d in %s mode', app.get('port'), app.get('env'));
	});
