'use strict';
var
 http           = require('http'),
 express        = require('express'),
 morgan         = require('morgan'),
 bodyParser     = require('body-parser'),
 methodOverride = require('method-override'),
 errorHandler   = require('errorhandler'),
 routes 				= require('./routes'),
 app            = express(),
 server         = http.createServer(app)
 countIdx			  = 0
;

switch(app.get('env')) {
	case  'production': 
	case 'development':
		app.use(morgan());
		app.use(errorHandler());
	default:
		app.use(bodyParser());
		app.use(methodOverride());
		app.use(express.static(__dirname + '/public'));
	break;
}

routes.configRoutes(app, server);
server.listen(3000);

console.log('Express server listening on port %d in %s mode', 
	server.address().port, 
	app.settings.env
);
