

Client = function (host,userId,authKey,apiId,debug)
{
    
        //TODO: need conf
        port = 6969;
        var adress = "ws://localhost"+":"+port+"/";
        var client = new WebSocket(adress);
        console.log(client.readyState);
        client.onopen = function () {
            
        };

        client.onerror = function (error) {
            // an error occurred when sending/receiving data
        };

    
    
	this.debug = debug || true;
	this.host = host;
	this.userId = userId;
	this.authKey = authKey;
	this.apiId = apiId;
	this.sendRequest = function (funcName,args,method,parseFunction,procError,httpError)
	{
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();//IE7+, Firefox, Chrome, Opera, Safari
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); //IE6, IE5
		args.api_id = this.apiId;
		args.auth_key = this.authKey;
		args.api_id = this.apiId;
                args.func_name = funcName;
		var params = JSON.stringify(args);
                client.send(params);
                if (typeof(parseFunction) === 'function')
                    parseFunction(args);
                    
                client.onmessage = function(msg)
                {

                    try {
                        var data = JSON.parse(msg.data);
                    } catch (e) {
                        console.log('This doesn\'t look like a valid JSON: ', msg);
                        return;
                    }

                    console.log("Error code: "+data.error_code)

                    parseFunction(data)
                }

	}
}
