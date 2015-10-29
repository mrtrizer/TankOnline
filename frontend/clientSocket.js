

Client = function (host,userId,authKey,apiId,debug,onReady)
{
    
        //TODO: need conf
        port = 6969;
        var adress = "ws://localhost"+":"+port+"/";
        this.client = new WebSocket(adress);
        
        this.client.onopen = function () {
            onReady();
        };

        this.client.onerror = function (error) {
            console.log("Error on sending/receiving data");
            // an error occurred when sending/receiving data
        };

    
    
	this.debug = debug || true;
	this.host = host;
	this.userId = userId;
	this.authKey = authKey;
	this.apiId = apiId;

	this.sendRequest = function (funcName,args,method,parseFunction,procError,httpError)
	{
		args.api_id = this.apiId;
		args.auth_key = this.authKey;
		args.api_id = this.apiId;
                args.func_name = funcName;
		var params = JSON.stringify(args);
                if (this.client.readyState != 1)
                {
                    console.log("Not ready");
                    httpError();
                }
                this.client.send(params);

                this.client.onmessage = function(msg)
                {

                    try {
                        var data = JSON.parse(msg.data);
                    } catch (e) {
                        console.log('This doesn\'t look like a valid JSON: ', msg);
                        return;
                    }

                    console.log("Error code: "+data.error_code)

                    if (typeof(parseFunction) === 'function')
                        parseFunction(data);
                }

	}
}
