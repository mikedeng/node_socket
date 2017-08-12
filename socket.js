'use strict';
var countUp,
	setWatch,
	http     = require('http'),
	fsHandle = require('fs'),
	express  = require('express'),
	socketIo = require('socket.io'),
	app      = express(),
	server   = http.createServer(app),
	io 			 = socketIo.listen(server),
	watchMap = {}
;

setWatch = function(url_path, file_type){
	console.log('setWatch called on ' + url_path);

	if (! watchMap[ url_path ]){
		console.log('setting watch on ' + url_path );

		fsHandle.watchFile(url_path.slice(1), function(current, previous){
			console.log('file accessed');
			if( current.mtime !== previous.mtime ){
				console.log('file changed');
				console.log([file_type, url_path]);
				io.sockets.emit( file_type, url_path );
			}
		});

		watchMap[ url_path ] = true;
	}
};

app.use(function(request, response, next){
	if( request.url.indexOf('/js/') >= 0){
		setWatch(request.url, 'script');
	}
	else if( request.url.indexOf('/css/') >= 0){
		setWatch(request.url, 'stylesheet');
	}
	next();
});

app.use(express.static(__dirname + '/'));

app.get('/', function(request, response){
	response.redirect('/socket.html');
});

server.listen(3000);
console.log('Express server listening on port %d in %s mode', 
	server.address().port, app.settings.env
);

// setInterval(countUp, 1000);
