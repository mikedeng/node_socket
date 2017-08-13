/*
 * spa.data.js
 * Data module
*

/* jslint browser: true, continue: true,
 devel: true, indent: 2, maxerr: 50,
 newcap: true,nomen: true, plusplus: true,
 regexp: true, sloppy: true, vars: false,
 white: true
*/

spa.data = (function () {
	'use strict'
	var initModule, stateMap = { sio: null }, makeSio, getSio;

	makeSio = function(){
		var socket = io.connect('/chat');
		return {
			emit: function( event_name, data ) {
				socket.emit( event_name, data );
			},
			on: function( event_name, callback ){
				socket.on(event_name, function(){
					callback( arguments );
				});
			}
		};
	};

	getSio = function() {
		if( !stateMap.sio ){ stateMap.sio = makeSio(); }
		return stateMap.sio;
	};

	initModule = function(){};
	return {
		initModule: initModule,
		getSio: getSio
	};
}());