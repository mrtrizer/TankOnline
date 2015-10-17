var fs = require('fs');

//Code from http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
//Posted by Emre Erkan
var merge = function() {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};

function loadConfig(configPath, onReady, onError)
{
	
	fs.readdir(configPath, function(err, files) {
			if (err)
			{
				onError(err);
				return;
			}
			var config = {};
			for (fileN in files)
			{
				var fileName = files[fileN];
				console.log("Config file loading: " + fileName);
				try 
				{
					var data = fs.readFileSync(configPath + "/" + fileName, {encoding: "utf8"});
				}
				catch (e) 
				{
					onError(e);
					break;
				}
				var fileConfig = eval("(" + data + ")");
				config = merge(config, fileConfig);
			}
			onReady(config);
		});
}

exports.loadConfig = loadConfig;
