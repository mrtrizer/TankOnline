var http = require("http");
var https = require('https');
var url = require("url");
var fs = require('fs');
var WebSocketServer = require('websocket').server;



function startSocketServer(route, handle, config)
{
    var server = http.createServer(function(request, response) {
        console.log("Server is created");        
    });
    server.listen(config.server_socket_port, function(data) { 
        console.log("Server listen get data");
    });

    // create the server
    wsServer = new WebSocketServer({
        httpServer: server
    });

    // WebSocket server
    wsServer.on('request', function(request) {
        var connection = request.accept(null, request.origin);
        console.log("Client is connected");
        connection.on('message', function(msg) {
            var recponce = ""
            console.log("Data is: "+msg.utf8Data)
            if(msg)
            {
                var data = JSON.parse(msg.utf8Data);
                route(handle,data.func_name,data,recponce);
                console.log("Server send data: "+recponce);
                connection.send(recponce);
            }
        });

        connection.on('close', function(connection) {
            // close user connection
        });
    });

}


function startHTTP(route, handle, config)
{
	function onRequest(request, response) 
	{
		var pathname = url.parse(request.url).pathname;
		//console.log("HTTP Request for " + pathname + " received.");
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
		//console.log("HTTPS Request for " + pathname + " received.");
		route(handle, pathname, request, response);
	}
	https.createServer(options,onRequest).listen(config.server_https_port);
	console.log("Server HTTPS has been started on port: " + config.server_https_port);
}

function start(route, handle, config) 
{
        startSocketServer(route,handle,config);
        startHTTP(route,handle,config);
}

exports.start = start;
