<!DOCTYPE html>
<html>
<head>
<title>Lab 1</title>
<meta charset="utf-8">
<link type="text/css" href="style.css" rel="stylesheet">
<!-- libs -->
<script src="js/three.js" type="text/javascript"></script>
<script src="js/Mirror.js" type="text/javascript"></script>
<script src="js/loaders/ObjLoader.js" type="text/javascript"></script>
<script src="client.js" type="text/javascript"></script>
<script src="tools.js" type="text/javascript"></script>
<script src="calc.js" type="text/javascript"></script>

<script>
    var scene, camera, renderer;
    var geometry, material, material1;
    var mesh;
    var mesh1;
    var tank1;
    var object = {};
    var collusions = false;
    var speedX = 0;
    var speedY = 0;
    var bullets = [];
    var bulletGeometry;
    var counter = 0;
    var counterBlue = 0;
    var play = false;
    var bodyAngleSpeed = 0;
    var sunAngle = 0;
    var lightDist = 100;
    var mapHeight = 200;
    var mapWidth = 420;
    var fullLoadCount = 0;
    var client = 0;
    var host = "";
    var timerId;
    var turels = [];
    var turel1 = null;
    var starPoses = [{x:-100,y:50},{x:150,y:50},{x:350,y:50}];
	var objects = [];
	var objectsMesh = [];
    var curTime = 0;
    var playerId = <?php echo $_GET["playerId"];?>;

	function getWidth() {
		if (self.innerWidth) {
		   return self.innerWidth;
		}
		else if (document.documentElement && document.documentElement.clientHeight){
			return document.documentElement.clientWidth;
		}
		else if (document.body) {
			return document.body.clientWidth;
		}
		return 0;
	}

	function getHeight() {
		if (self.innerHeight) {
			return self.innerHeight;
		}

		if (document.documentElement && document.documentElement.clientHeight) {
			return document.documentElement.clientHeight;
		}

		if (document.body) {
			return document.body.clientHeight;
		}
		return 0;
	}

	function getRand(min, max)
	{
	  return Math.floor(Math.random() * (max - min) + min);
	}


var textureList = [];
var textureCount = 0;
var imageCount = 0;
var onLoaded = 0;
var manager = 0;
var loadCount = 0;
	

	function loadTexture(imageLoader,imgName)
	{
		imageLoader.load(imgName , function ( image ) 
		{
			var texture = new THREE.Texture();
			texture.image = image;
			texture.needsUpdate = true;
			textureList[imgName] = texture;
			textureCount++;
			if (textureCount == imageCount)
				onLoaded(manager,textureList);
		} );
	}

	function loadTextures(list, manager, onLoaded)
	{
		var imageLoader = new THREE.ImageLoader(manager);
		imageCount = list.length;
		this.onLoaded = onLoaded;
		this.manager = manager;
		for (var i in list)
		{
			loadTexture(imageLoader,list[i]);
		}
	}
	
	function loadObject(manager, name, textureList, textureName,onLoaded)
	{
		loadCount++;
		if (loadCount > fullLoadCount)
			fullLoadCount = loadCount;
		var objLoader = new THREE.OBJLoader(manager);
		objLoader.load(name, function(object) 
		{
			object.traverse( function ( child ) 
			{
				if ( child instanceof THREE.Mesh ) 
				{
					child.material.map = textureList[textureName];
					child.receiveShadow = true;
					child.castShadow = true;
				}
			});
			loadCount--;
			if (loadCount == 0)
				objectsLoaded();
			onLoaded(object);
		});
	}

	function setObject(object,x,y,z,angle)
	{
			var clone = object.clone();
			clone.position.x = x;
			clone.position.z = z;
			clone.position.y = y;
			clone.rotation.z = angle;
			scene.add(clone);
			return clone;
	}

	function loadObjects(manager, textureList)
	{
		// load model
		loadObject(manager,'tank1.obj',textureList,'tank1.png', function (object){
			tank1 = object;
			});
		loadObject(manager,'tree.obj',textureList,'tree.png', function (object){
			tree = object;
			});
	}
	
	function enterGame(onEntered)
	{
		client.sendRequest("enter_game", {time:curTime,id:playerId}, "GET", function (responce){
			objects = responce["objects"];
			onEntered();
		});
	}
	
	function objectsLoaded()
	{
		enterGame(initMap);
	}
	
	function initApp() 
    {
		host = Network.detectHost();
		client = new Client(host + "coldcats/",playerId,0,0);
		scene = new THREE.Scene();
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) 
		{

		};
		loadTextures(['tank1.png','tree.png','turel.png'], manager, loadObjects);
    }
    
    // function for drawing rounded rectangles
	function roundRect(ctx, x, y, w, h, r) 
	{
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.lineTo(x+w-r, y);
		ctx.quadraticCurveTo(x+w, y, x+w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();   
	}

	function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
    }

	function initMap()
	{
		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 300;
		camera.position.y = -200;
		camera.rotation.x = Math.PI / 4;
		var lavaTexture = THREE.ImageUtils.loadTexture( 'ground.jpg' );
		lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
		lavaTexture.repeat.set( 5, 5 );
		var lavaMaterial = new THREE.MeshBasicMaterial( { map: lavaTexture } );
		var lavaBall = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000), lavaMaterial );
		lavaBall.position.z =  - 20;
		lavaBall.receiveShadow = true;
		scene.add( lavaBall );    
		
		for(var i in objects)
		{
			var object = objects[i];
			var n = objectsMesh.length;
			objectsMesh[n] = setObject(tank1,object.x,object.y,40,object.angle);
			objectsMesh[n].object = object;
			var sprite = makeTextSprite("Player " + object.id,{ fontsize: 60, fontface: "Arial", borderColor: {r:0, g:200, b:0, a:1.0} });
			sprite.position.z = 20;
			sprite.position.x = 0;
			sprite.position.y = 0;
			objectsMesh[n].add(sprite);  
		}
		
		var material = new THREE.LineBasicMaterial({
			color: 0x007700
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 0, 100, 0 ),
			new THREE.Vector3( 0, 1000, 0 )
		);

		var line = new THREE.Line( geometry, material );
		
		getCurMesh().traverse( function ( child ) 
		{
			if (child.name.indexOf("head") > -1)
			{ 
				child.add( line );
				child.add(camera);
			}
		});
		
		sunLight = new THREE.DirectionalLight( 0xffffaa, 1.3 );
		sunLight.castShadow = true;
		sunLight.position.set( lightDist, lightDist, 400 );
		scene.add( sunLight );
		
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;

		renderer.shadowCameraNear = 3;
		renderer.shadowCameraFar = camera.far;
		renderer.shadowCameraFov = 50;

		renderer.shadowMapBias = 0.0039;
		renderer.shadowMapDarkness = 1;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024;

        document.body.appendChild( renderer.domElement );
        window.addEventListener( 'resize', onWindowResize, false );
        startGame();
        
        sendEventList();//Start event generation
	}

	function startGame()
	{
		timerId = setInterval(recalcAll, 40);
		animate();
	}

	function findUser(id,usersInfo)
	{
		var result = null;  
		for (var i in usersInfo)
		{
			if(id == usersInfo[i].uid)
			{
				result = usersInfo[i];
				break;
			}
		}
		return result;
	}

	function sign(a)
	{
		return a?a<0?-1:1:0;
	}

	function onWindowResize() {
		camera.left = window.innerWidth / - 2;
		camera.right = window.innerWidth / 2;
		camera.top = window.innerHeight / 2; 
		camera.bottom = window.innerHeight / - 2;
		camera.updateProjectionMatrix();
        
        renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function render()
	{
		renderer.render( scene, camera );
	}
	
	function meshRecalc()
	{
		for (var i in objectsMesh)
		{
			var mesh = objectsMesh[i];
			var object = objectsMesh[i].object;
			mesh.position.x = object.x;
			mesh.position.y = object.y;
			if (object.type == "tank")
			{
				mesh.position.z = 20;
				mesh.rotation.z = object.angle;
				mesh.traverse( function ( child ) 
				{
					if (child.name.indexOf("head") > -1) 
						child.rotation.z = -object.head_angle - object.angle;
				});
			}
		}
	}
	
	function addBullet(x,y,size,color,z)
	{
		var bulletMesh = new THREE.Mesh( new THREE.SphereGeometry( size,8), new THREE.MeshBasicMaterial( {color: color} ) );
		bulletMesh.position.x = x;
		bulletMesh.position.y = y;
		bulletMesh.position.z = z ;
		scene.add(bulletMesh);
		return bulletMesh;
	}
	
	function constructObject(object)
	{
		if (object.type == "bullet")
		{
			var bullet = addBullet(object.x, object.y, 5, 0xff0000, 20);
			bullet.object = object;
			objectsMesh[objectsMesh.length] = bullet;
		}
	}
	
	function destructObject(object)
	{
		if (object.type == "bullet")
		{
			for (var i in objectsMesh)
			{
				if (objectsMesh[i].object.id == object.id)
				{
					scene.remove(objectsMesh[i]);
					objectsMesh.splice(i,1);
				}
			}
		}
		if (object.type == "tank")
		{
			for (var i in objectsMesh)
			{
				if (objectsMesh[i].object.id == object.id)
				{
					if (object.id == playerId)
						gameOver();
					scene.remove(objectsMesh[i]);
					objectsMesh.splice(i,1);
				}
			}
		}
	}
	
	function getMesh(id)
	{
		for (var i in objects)
		{
			if (objectsMesh[i].object.id == id)
				return objectsMesh[i]; 
		}
	}
	
	function getCurMesh()
	{
		return getMesh(playerId);
	}
	
	function recalcAll()
	{
		curTime++;
		recalc();
		meshRecalc();
	}
	
    function animate() {
		requestAnimationFrame( animate );
		render();
    }
	
	var events = [];
	
	function onEventResponce(data)
	{
		console.log("Event responce" + JSON.stringify(data));
		if (data.events.length > 0)
		{
			var prevEventTime = data["last_request_time"];
			for (var i in data.events)
			{
				var playerId = data.events[i].player;
				var event = data.events[i];
				var timeD = event.cur_time - prevEventTime;
				for (var j = 0; j < timeD; j++)
					recalcObject(getObject(playerId));
				procEvent(playerId, event);
				prevEventTime = event.cur_time;
			}
			recalcObject(getObject(playerId));
		}
		for (var i in objects)
		{
			for (var j in data.objects)
			{
				if ((objects[i].id == data.objects[j].id) && (objects[i].id == playerId))
				{
					objects[i].x = data.objects[j].x;
					objects[i].y = data.objects[j].y;
					objects[i].angle = data.objects[j].angle;
				}
			}
		}
		meshRecalc();
		setTimeout(sendEventList,100);
	}
	
	function onEventResponceError(data)
	{
		setTimeout(sendEventList,500);
	}
	
	function sendEventList()
	{
		var data = {id:playerId, events:events};
		client.sendRequest("event", data, "GET", onEventResponce, onEventResponceError);
		events = [];
	}
	
	var prevEventTime = 0;
	
	function genEvent(type,params)
	{
		var event = {cur_time:curTime, type:type, params:params, player:playerId, event_d: curTime - prevEventTime};
		prevEventTime = curTime;
		return event;
	}
	
	function sendEvent(event)
	{
		events[events.length] = event;
	}
	
	function shareEvent(event)
	{
		procEvent(playerId,event);
		sendEvent(event);
	}

	var lastKey = 0;

	function onKeyDown(e)
	{
		if (e.keyCode == lastKey)
			return;
		if (e.keyCode == 65)
		{
			shareEvent(genEvent("rotate_right_start"));
		}
		if (e.keyCode == 68)
		{
			shareEvent(genEvent("rotate_left_start"));
		}
		if (e.keyCode == 87)
		{
			shareEvent(genEvent("move_fwd_start"));
		}
		if (e.keyCode == 83)
		{
			shareEvent(genEvent("move_back_start"));
		}
		lastKey = e.keyCode;
	}

	function onKeyUp(e)
	{
		lastKey = 0;
		if (e.keyCode == 65)
		{
			shareEvent(genEvent("rotate_right_stop"));
		}
		if (e.keyCode == 68)
		{
			shareEvent(genEvent("rotate_left_stop"));
		}
		if (e.keyCode == 87)
		{
			shareEvent(genEvent("move_fwd_stop"));
		}
		if (e.keyCode == 83)
		{
			shareEvent(genEvent("move_back_stop"));
		}
	}

	function onMouseMove(e)
	{
		var x = e.pageX - getWidth() / 2;
		var y = -e.pageY + getHeight() / 2;
		var headAngle = x / 100;
		shareEvent(genEvent("set_head_angle",{head_angle:headAngle}));
		var angle = y / 200;
		if (angle > 0)
			angle = 0;
		camera.rotation.x = angle + Math.PI / 2;
		camera.position.z = -Math.sin(angle) * 400;
		camera.position.y = -Math.cos(angle) * 400;
	}

	function onClick(e)
	{
		var xOffset = 10 * Math.cos(getCurObject().head_angle);
		var yOffset = 10 * Math.sin(getCurObject().head_angle);
		shareEvent(genEvent("shoot",{head_angle:getCurObject().head_angle, sender:playerId}));
	}

	function bodyLoaded()
	{
		initApp();
	}
	
	function gameOver()
	{
		var window = document.getElementById("finish_window");
		window.style.visibility = "visible";
	}

	document.onkeydown=onKeyDown;
	document.onkeyup=onKeyUp;
</script>
</head>
<body onload="bodyLoaded()" onmousemove="onMouseMove(event)" onclick="onClick(event)">
	<div id="finish_window" class="window">
		Игра окончена.
	</div>
</body>
</html>
