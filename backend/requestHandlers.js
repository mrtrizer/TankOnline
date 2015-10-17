var exec = require("child_process").exec;
var mysql = require('mysql');
var url = require("url");
var qs = require('querystring');
var fs = require('fs');
var path = require('path');
var util = require('util');
var calc = require('../calc');
var resPath = './res/project.res';
var dbConnection = null;

function connectToDb(config)
{
	console.log('Connecting to database.');
	console.log('host: ' + config.mysql_host);
	console.log('port: ' + config.mysql_port);
	console.log('user: ' + config.mysql_user);
	console.log('password: ' + config.mysql_pass);
	
	dbConnection = mysql.createConnection({
		host     : config.mysql_host,
		port     : config.mysql_port,
		user     : config.mysql_user,
		password : config.mysql_pass
	});

	dbConnection.connect(function(err) {
		if (err) 
		{
			console.error('error connecting: ' + err.stack);
			return;
		}
		dbConnection.query('USE coldcats', function(err, rows, fields) {
			if (err) 
				throw err;
			console.log('Db selected');
		});
	});
}

function init(config)
{
	connectToDb(config);
	resPath = config.res_path || resPath;
	console.log("ABEngine resource path: " + resPath);
}

function writeResponse(response,data,error,errorMsg,err)
{
	if (!error)
		error = 0;
	if (!data)
		data = {};
	if (errorMsg)
		console.log((error == 0?'':'ERROR: ') + errorMsg);
	data.error_code = error;
	if ((error != 0) && errorMsg)
		data.error_msg = errorMsg;
	console.log('Response. Error code: '+ error + " Message: " + (errorMsg || "OK" ));
	if (err != undefined)
		console.log(err);
	try 
	{
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.write(JSON.stringify(data));
		response.end();
	} 
	catch(e) 
	{
		console.log('Write responce error: ' + e);
	}
}

function readPost(request, onFinish, onError)
{
    if (request.method == 'POST') 
    {
        var body = '';
        request.on('data', function (data) {
				body += data;

				// Too much POST data, kill the connection!
				if (body.length > 1e6)
				{
					request.connection.destroy();
					if (onError)
						onError("The message is too long. Current length: " + body.length);
					return;
				}
			});
        request.on('end', function () {
				var post = qs.parse(body);
				onFinish(post);
			});
	}
	else
	{
		if (onError)
			onError("Request type is not POST.");
	}
}

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkVars(vars, list)
{
	for (var i in list)
		if (!vars[list[i]])
			return false
	return true;
}

var users = {};
var curTime = 0;
var objects = [
		{id:10, type:"tank", x: -100, y:0, speed_y: 0, rotate_speed: 0, angle:0, head_angle:0, health:100}, 
		{id:20, type:"tank", x:100, y:0, speed_y: 0, rotate_speed: 0, angle:0, head_angle: 0, health:100},
		{id:30, type:"tank", x:300, y:0, speed_y: 0, rotate_speed: 0, angle:0, head_angle: 0, health:100}]
calc.setObjects(objects);
var events = [];

function onTimer()
{
	curTime++;
	//calc.recalc();
}

setInterval(onTimer, 40);

function enterGame(request,response)
{
	var query = url.parse(request.url,true).query;
	var time = query.time;
	var id = query.id;
	users[id] = {timeOffset: curTime - time}; //offset = server - client
	console.log("Enter game id:" + id + " time:" + users[id].timeOffset);
	writeResponse(response,{id:id,objects:objects});
}

function syncClock(request,responce)
{
	var query = url.parse(request.url,true).query;
	var delay = query.delay;
	var id = query.id;
	users[id].delay = delay;
	console.log("Sync clock id:" + id + " delay:" + delay);
	writeResponse(response,data);
}

function onEvent(request,response)
{
	var data = {};
	var query = url.parse(request.url,true).query;
	var userId = query.id;
	var inEvents = JSON.parse(query.events);
	//console.log("Users: " + JSON.stringify(users));
	//console.log("Events in: " + JSON.stringify(inEvents) + " id: " + userId);
	for (var i in inEvents)
	{
		var event = inEvents[i];
		event.time = users[userId].timeOffset + event.cur_time; //time = client + offset
		for (var j = 0; j < event.event_d; j++)
			calc.recalcObject(calc.getObject(userId));
		calc.procEvent(userId,inEvents[i]);
		event.in_time = curTime;
		events[events.length] = event;
	}
	//console.log("Events cur: " + JSON.stringify(events));
	var oldestRequestTime = 0;
	for (var i in users)
	{
		if (users[i].lastRequestTime > oldestRequestTime)
			oldestRequestTime = users[i].lastRequestTime;
	}
	//console.log("Oldest request time: " + oldestRequestTime);
	var responceEvents = [];
	for (var i in events)
	{
		var event = events[i];
		if ((event.in_time > users[userId].lastRequestTime) && (event.player != userId))
		{
			var eventClone = JSON.parse(JSON.stringify(event));
			eventClone.time = eventClone.time - users[userId].timeOffset;
			responceEvents[responceEvents.length] = eventClone;
		}
		if (event.in_time + 100 < oldestRequestTime)
		{
			events.splice(i,1);
		}
	}
	//console.log("Events out: " + JSON.stringify(responceEvents));
	//console.log("Objects: " + JSON.stringify(objects));
	data = {events:responceEvents, last_request_time: users[userId].lastRequestTime + users[userId].timeOffset,
			objects:objects};
	users[userId].lastRequestTime = curTime;
	writeResponse(response,data);
}

var handlers = {
	"enter_game":enterGame,
	"event":onEvent,
	"sync_clock":syncClock
}

exports.init = init;

exports.handlers = handlers;
