var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');
    
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "mp3": "audio/mpeg mp3"};

function route(handle, pathname, request, response) 
{
	//console.log("About to route a request for " + pathname);
        console.log("FuncName: "+pathname);
        if(pathname.indexOf("/"))
            pathname = pathname.replace(/\/+/,"");
	if (typeof handle[pathname] === 'function') 
	{
            console.log("Type is function"); 
            handle[pathname](request,response);
	}
	else 
	{
                console.log("Type is not function");
		var fileName = path.join(process.cwd(), pathname);

		fs.exists(fileName, function(exists) {
			if(!exists) {
				console.log("No request handler found: " + pathname);
				console.log("File not exists: " + fileName);
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 Not Found\n');
				response.end();
				return;
			}
			if (!fs.lstatSync(fileName).isFile())
			{
				response.writeHead(423, {'Content-Type': 'text/plain'});
				response.write('423 Locked\n');
				return;
			}
			var pathItems = path.extname(fileName).split(".");
			var mimeType = mimeTypes[pathItems[pathItems.length - 1]];
			response.writeHead(200, {'Content-Type': mimeType, "Cache-Control": "no-cache"});
			var fileStream = fs.createReadStream(fileName);
			fileStream.pipe(response);
		}); //path.exists

	}
}

exports.route = route;
