'use strict';

var loadSchema,
	checkSchema,
	configRoutes,
	fsHandle    = require('fs'),
	JSV         = require('JSV').JSV,
	mongodb     = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url         = 'mongodb://localhost:27017/spa',
	makeMongoId = mongodb.ObjectID,
	opDb,
	objTypeMap  = { 'users': {} },
	validator   = JSV.createEnvironment()
;

loadSchema = function(schema_name, schema_path){
	fsHandle.readFile(schema_path, 'utf8', function(err, data){
		objTypeMap[schema_name] = JSON.parse(data);
	})
};

checkSchema = function(obj_type, obj_map, callback){
	var
		schema_map = objTypeMap [obj_type],
		report_map = validator.validate(obj_map, schema_map)
	;
	callback( report_map.errors );
};

opDb = function(request, callback){
	MongoClient.connect(url, function(err, db) {
	  var type = request.params.obj_types;
	  db.collection(type, function(outer_error, collection){
	  	callback(outer_error, collection)
	  });
	  db.close();
	});
}

configRoutes = function(app, server){
	app.get('/', function(request, response){
		response.redirect('/spa.html')
	});

	app.all('/:obj_types', function(request, response, next){
		response.contentType('json');
		console.log(objTypeMap[ request.params.obj_types ]);
		if( objTypeMap[ request.params.obj_types ] ){
			next();
		}else{
			response.send({error_msg: request.params.obj_types + 'is not a valid object type'});
		}
	});

	app.get('/:obj_types', function(request, response){
		opDb(request, function(outer_error, collection){
			collection.find({}).toArray(function(inner_error, map_list){
				response.send(map_list);
			});
		});
	});

	app.post('/:obj_types', function(request, response){
		var obj_type = request.params.obj_types,
			obj_map = request.body;

		checkSchema(obj_type, obj_map, function(error_list){
			if( error_list.length === 0 ){
				opDb(request, function(outer_error, collection){
					var options_map = { safe: true },
							obj_map = request.body;

					collection.insert(obj_map, options_map, function(inner_error, result_map){
						response.send(result_map);
					});
				});
			}else{
				response.send({ error_msg: 'Input document not valid', error_list: error_list });
			}
		})
	});

	app.get('/:obj_types/:id', function(request, response){
		opDb(request, function(outer_error, collection){
			var find_map = { _id: makeMongoId(request.params.id) };

			collection.findOne(find_map, function(inner_error, result_map){
				response.send(result_map);
			});
		});
	});

	app.patch('/:obj_types/:id', function(request, response){
		opDb(request, function(outer_error, collection){
			var find_map = { _id: makeMongoId(request.params.id) },
				obj_map = request.body;

			var sort_order = [],
				options_map = {
					'new': true, upsert: false
				};

			collection.findAndModify(
				find_map, 
				sort_order, 
				obj_map, 
				options_map, 
				function(inner_error, updated_map){
					response.send(updated_map);
			});
		});
	});

	app.delete('/:obj_types/:id', function(request, response){
		opDb(request, function(outer_error, collection){
			var find_map = { _id: makeMongoId(request.params.id) },
				options_map = { single: true };
				// obj_map = request.body;

			collection.remove(
				find_map, 
				options_map,
				function(inner_error, delete_count){
					response.send({ delete_count: delete_count });
			});
		});
	});
}
module.exports = { configRoutes: configRoutes };

(function(){
	var schema_name, schema_path;
	for(schema_name in objTypeMap){
		if( objTypeMap.hasOwnProperty( schema_name )){
			schema_path = __dirname + '/' + schema_name + '.json';
			loadSchema(schema_name, schema_path);
		}
	}
}());