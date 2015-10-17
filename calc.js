var objects = [];
var playerSpeed = 6;
var playerAngleSpeed = 0.05;
var lastBulletId = 1000;

function setObjects(newObjects)
{
	objects = newObjects;
}

function addObject(object)
{
	objects[objects.length] = object;
	if (typeof(constructObject) == "function")
		constructObject(object);
}

function removeObject(object)
{
	if (typeof(destructObject) == "function")
		destructObject(object);
	for (var i in objects)
	{
		if (objects[i].id == object.id)
			objects.splice(i,1);
	}
}

function createBullet(object,headAngle)
{
	var speedX = 10 * Math.cos(-Math.PI /2 + object.head_angle);
	var speedY = 10 * -Math.sin(-Math.PI /2 + object.head_angle);
	lastBulletId += 1;
	addObject({id:lastBulletId, type:"bullet", x:object.x, y:object.y, speed_x:speedX, speed_y:speedY});
}

function procEvent(object, event)
{
	if (event.type == "move_fwd_start")
		getObject(object).speed_y = 1;
	if (event.type == "move_fwd_stop")
		getObject(object).speed_y = 0;
	if (event.type == "move_back_start")
		getObject(object).speed_y = -1;
	if (event.type == "move_back_stop")
		getObject(object).speed_y = 0;
	if (event.type == "rotate_right_start")
		getObject(object).rotate_speed = -2;
	if (event.type == "rotate_left_start")
		getObject(object).rotate_speed = 2;
	if (event.type == "rotate_right_stop")
		getObject(object).rotate_speed = 0;
	if (event.type == "rotate_left_stop")
		getObject(object).rotate_speed = 0;
	if (event.type == "shoot")
		createBullet(getObject(object),event.params.head_angle);
	if (event.type == "set_head_angle")
		getObject(object).head_angle = event.params.head_angle;
}

function getObject(id)
{
	for (var i in objects)
	{
		if (objects[i].id == id)
			return objects[i]; 
	}
}

function getCurObject()
{
	return getObject(playerId); //Find corresponding object
}

function recalcObject(object)
{
	if (object.type == "tank")
	{
		object.angle -= object.rotate_speed * playerAngleSpeed;
		object.x += Math.cos(object.angle + Math.PI / 2) * playerSpeed * object.speed_y;
		object.y += Math.sin(object.angle + Math.PI / 2) * playerSpeed * object.speed_y;
	}
	if (object.type == "bullet")
	{
		object.x += object.speed_x;
		object.y += object.speed_y;
		if ((object.x > 500) || (object.y > 500) || (object.x < -500) || (object.y < -500))
			removeObject(object);
	}
}

function recalcType(type)
{
	for (var i in objects)
	{
		if (objects[i].type == type)
			recalcObject(objects[i]);
	}
}

function recalc()
{
	for (var i in objects)
	{
		recalcObject(objects[i]);
	}
}

if (typeof exports !== 'undefined')
{
	exports.procEvent = procEvent;
	exports.getObject = getObject;
	exports.getCurObject = getCurObject;
	exports.recalcObject = recalcObject;
	exports.recalc = recalc;
	exports.recalcType = recalcType;
	exports.setObjects = setObjects;
}
