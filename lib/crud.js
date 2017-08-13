'use strict';
var loadSchema,
	checkSchema,
	clearIsOnline,
	fsHandle    = require('fs'),
	JSV         = require('JSV').JSV,
	mongodb     = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	url         = 'mongodb://localhost:27017/spa',
	makeMongoId = mongodb.ObjectID,
	opDb,
	objTypeMap  = { 'users': {} },
	validator   = JSV.createEnvironment(),
	checkType, 
	constructObj, readObj,
	updateObj, destroyObj
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

clearIsOnline = function(){
	updateObj('users', { is_online: true}, { is_online: false}, 
		function(response_map){
			console.log( 'All users set to offline', response_map );
		}
	);
};

opDb = function(obj_types, callback){
	MongoClient.connect(url, function(err, db) {
	  db.collection(obj_types, function(outer_error, collection){
	  	callback(outer_error, collection)
	  });
	  db.close();
	});
}


constructObj = function(obj_types, obj_map, callback){
	var type_check_map = checkType(obj_types);
	if ( type_check_map ){
		callback( type_check_map );
		return;
	}

	checkSchema(obj_types, obj_map, function(error_list){
		if( error_list.length === 0 ){
			opDb(obj_types, function(outer_error, collection){
				var options_map = { safe: true };

				collection.insert(obj_map, options_map, function(inner_error, result_map){
					callback(result_map);
				});
			});
		} else {
			callback({ error_msg: 'Input document not valid', error_list: error_list });
		}
	});
};

checkType = function (obj_type) {
	if( !objTypeMap[ obj_type ]){
		return ({ error_msg: 'Object type"' + obj_type + '" is not supported.' });
	}

	return null;
};

readObj = function(obj_types, find_map, fields_map, callback){
	var type_check_map = checkType(obj_types);
	if(type_check_map){
		callback(type_check_map);
		return;
	}

	opDb(obj_types, function(outer_error, collection){
		collection.find(find_map, fields_map).toArray(function(inner_error, map_list){
			callback(map_list);
		});
	});
};

updateObj = function(obj_types, find_map, set_map, callback){
	var type_check_map = checkType( obj_types );
	if( type_check_map ){
		callback( type_check_map );
		return;
	}

	checkSchema(obj_types, set_map, function(error_list){
		if( error_list.length === 0 ){
			opDb(obj_types, function(outer_error, collection){
				var options_map = { safe: true, multi: true, upsert: false};

				collection.update(find_map, {$set: set_map}, options_map,
				 function(inner_error, update_count){
					callback({update_count: update_count});
					}
				);
			});
		} else {
			callback({ error_msg: 'Input document not valid', error_list: error_list });
		}
	});
};

destroyObj = function(obj_types, find_map, callback){
	var type_check_map = checkType( obj_types );
	if( type_check_map ){
		callback( type_check_map );
		return;
	}


	opDb(obj_types, function(outer_error, collection){
		var options_map = { safe: true, single: true}

		collection.remove(find_map, options_map,
		 function(inner_error, delete_count){
				callback({delete_count: delete_count});
			}
		);
	});
};

module.exports = {
	makeMongoId: mongodb.ObjectID,
	checkType: checkType,
	construct: constructObj,
	read: readObj,
	update: updateObj,
	destroy: destroyObj
};

console.log('** CRUD module loaded **');

clearIsOnline();
(function(){
	var schema_name, schema_path;
	for(schema_name in objTypeMap){
		if( objTypeMap.hasOwnProperty( schema_name )){
			schema_path = __dirname + '/' + schema_name + '.json';
			loadSchema(schema_name, schema_path);
		}
	}
}());