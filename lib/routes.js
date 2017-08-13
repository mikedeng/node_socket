'use strict';

var configRoutes,
	crud = require('./crud'),
	chat = require('./chat')
;

configRoutes = function(app, server){
	chat.connect( server );
	app.get('/', function(request, response){
		response.redirect('/spa.html')
	});

	app.all('/:obj_types', function(request, response, next){
		response.contentType('json');
		next();
	});

	app.get('/:obj_types', function(request, response){
		crud.read(request.params.obj_types, {}, {}, function (map_list) {
			response.send(map_list);
		});
	});

	app.post('/:obj_types', function(request, response){
		crud.construct(request.params.obj_types, request.body, function (result_map) {
			response.send(result_map);
		});
	});

	app.get('/:obj_types/:id', function(request, response){
		crud.read(request.params.obj_types, { _id: crud.makeMongoId(request.params.id) }, {}, function (map_list) {
			response.send(map_list);
		});
	});

	app.patch('/:obj_types/:id', function(request, response){
		crud.update(request.params.obj_types, {_id: crud.makeMongoId(request.params.id)}, 
				request.body, function (result_map) {
			response.send(result_map);
		});
	});

	app.delete('/:obj_types/:id', function(request, response){
		crud.destroy(request.params.obj_types, {_id: crud.makeMongoId(request.params.id)}, function (result_map) {
			response.send(result_map);
		});
	});
};
module.exports = { configRoutes: configRoutes };
