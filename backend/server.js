var http = require("http");
var https = require('https');
var url = require("url");
var fs = require('fs');

function startHTTP(route, handle, config)
{
	function onRequest(request, response) 
	{
		var pathname = url.parse(request.url).pathname;
		console.log("HTTP Request for " + pathname + " received.");
		route(handle, pathname, request, response);
	}
	http.createServer(onRequest).listen(config.server_http_port);
	console.log("Server HTTP has been started on port: " + config.server_http_port);
}

function startHTTPS(route, handle, config)
{
	try 
	{
		var options = {
			key: fs.readFileSync(config.ssl_key),
			cert: fs.readFileSync(config.ssl_crt)
		};
	}
	catch (e)
	{
		console.log("ERROR: HTTPS server starting errors occurs. Message: " + e.message);
		return;
	}
	
	function onRequest(request, response) 
	{
		var pathname = url.parse(request.url).pathname;
		console.log("HTTPS Request for " + pathname + " received.");
		route(handle, pathname, request, response);
	}
	https.createServer(options,onRequest).listen(config.server_https_port);
	console.log("Server HTTPS has been started on port: " + config.server_https_port);
}

function start(route, handle, config) 
{
	startHTTP(route, handle,config);
	startHTTPS(route, handle,config);
}

exports.start = start;
