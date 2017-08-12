'use strict';

var configRoutes;

configRoutes = function(app, server){
	app.get('/', function(request, response){
		response.redirect('/spa.html')
	});

	app.all('/:obj_types/*?', function(request, response, next){
		response.contentType('json');
		next();
	});


	app.get('/:obj_types', function(request, response){
		response.send({ title: request.params.obj_types + ' list' });
	});

	app.post('/:obj_types', function(request, response){
		response.send({title: request.params.obj_types + ' created'});
	});

	app.get('/:obj_types/:id([0-9]+)', function(request, response){
		response.send({title: request.params.obj_types + ' with id ' + request.params.id + ' found'});
	});

	app.patch('/:obj_types/:id([0-9]+)', function(request, response){
		response.send({title: request.params.obj_types + ' with id ' + request.params.id + ' updated'});
	});

	app.delete('/:obj_types/:id([0-9]+)', function(request, response){
		response.send({title: request.params.obj_types + ' with id ' + request.params.id + ' delete'});
	});
}
module.exports = { configRoutes: configRoutes };