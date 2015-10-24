var configLoader = require("./configLoader");
var server = require("./serverSocket");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = requestHandlers.handlers;

var configPath = "./config.d";
console.log("Config is loading from " + configPath);

function onConfigLoad(config)
{
	console.log("Config has been loaded.");
	console.log("Current config: " + JSON.stringify(config));
	requestHandlers.init(config);
	server.start(router.route, handlers, config);
}

function onConfigLoadErr(err)
{
	console.log("ERROR: Config loading error. Message: " + err.message);
}

//Entry point
configLoader.loadConfig(configPath,onConfigLoad,onConfigLoadErr);
