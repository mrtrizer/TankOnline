if (typeof(require) === "function")
	var MathTools = require('./tools').MathTools;

var objects = [];
var playerSpeed = 6;
var playerAngleSpeed = 0.05;
var lastBulletId = 1000;
var prevEventTime = 0;

function isInRange(start,end,value)
{
	if ((value > start) && (value < end))
		return true;
	return false;
}

function isCollusion(mesh, point, size)
{
	if (isInRange(mesh.position.x - size, mesh.position.x + size, point.x) &&
			isInRange(mesh.position.y - size, mesh.position.y + size, point.y))
		return true;
	return false;
}

function getDist(object1,object2)
{
	return Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
}

function isIntersection (object,x,y)
{
	var objectAbsolute = {
		x1:object.x,
		y1:object.y,
		x2:object.x + object.width,
		y2:object.y + object.height
	}
	if ((objectAbsolute.x1 < x) &&
		(objectAbsolute.x2 > x) &&
		(objectAbsolute.y1 < y) &&
		(objectAbsolute.y2 > y))
		return true;
	else
		return false;
}

function setObjects(newObjects)
{
	objects = newObjects;
}

function addObject(object)
{
	for (var i in objects)
		if (objects[i].id == object.id)
			return;
	objects[objects.length] = object;
	if (typeof(constructObject) == "function")
		constructObject(object);
}

function removeObject(object)
{
	if (typeof(destructObject) == "function")
		destructObject(object);
	for (var i in objects)
		if (objects[i].id == object.id)
			objects.splice(i,1);
}

function createBullet(object,event)
{
	var speedX = 50 * Math.cos(-Math.PI /2 + event.params.head_angle);
	var speedY = 50 * -Math.sin(-Math.PI /2 + event.params.head_angle);
	addObject({
		id:event.params.bullet_id, 
		type:"bullet", 
		sender:event.params.sender, 
		x:object.x, 
		y:object.y, 
		speed_x:speedX, 
		speed_y:speedY,
		owner: 1000});
}

function procEvent(objectId, event)
{
	var object = getObject(objectId);
	if (event.type == "move_fwd_start")
		object.speed_y = 1;
	if (event.type == "move_fwd_stop")
		object.speed_y = 0;
	if (event.type == "move_back_start")
		object.speed_y = -1;
	if (event.type == "move_back_stop")
		object.speed_y = 0;
	if (event.type == "rotate_right_start")
		object.rotate_speed = -2;
	if (event.type == "rotate_left_start")
		object.rotate_speed = 2;
	if (event.type == "rotate_right_stop")
		object.rotate_speed = 0;
	if (event.type == "rotate_left_stop")
		object.rotate_speed = 0;
	if (event.type == "shoot")
		createBullet(object,event);
	if (event.type == "set_head_angle")
		object.head_angle = event.params.head_angle;
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

function recalcObject(object, curTime)
{
	if (object.type == "tank")
	{
		object.angle -= object.rotate_speed * playerAngleSpeed;
		var newX = object.x + Math.cos(object.angle + Math.PI / 2) * playerSpeed * object.speed_y;
		var newY = object.y + Math.sin(object.angle + Math.PI / 2) * playerSpeed * object.speed_y;
		var collusion = false;
		for (var i in objects)
		{
			if (objects[i].type == "tank")
			{
				if (objects[i].id == object.id)
					continue;
				var dist = getDist(objects[i], {x:newX, y:newY});
				if (dist < 70)
				{
					collusion = true;
					break;
				}
			}
			if (objects[i].type == "wall")
				if (isIntersection(objects[i], newX, newY))
				{
					collusion = true;
					break;
				}
		}
		if ((newX > 450) || (newY > 450) || (newX< -450) || (newY < -450))
			collusion = true;
		if (collusion == false)
		{
			object.x = newX;
			object.y = newY;
		}
	}
	if (object.type == "bullet")
	{
		var newCoords = {
			x: object.x + object.speed_x, 
			y: object.y + object.speed_y}
		for (var i in objects)
		{
			var curObject = objects[i];
			if (curObject.type != "tank")
				continue;
			if (curObject.id == object.sender)
				continue;
			var iter1 = MathTools.getIterPoint(newCoords, object, {x:curObject.x - 20, y:curObject.y}, {x:curObject.x + 20, y:curObject.y});
			var iter2 = MathTools.getIterPoint(newCoords, object, {x:curObject.x, y:curObject.y - 20}, {x:curObject.x, y:curObject.y + 20});
			if ((iter1 != null) || (iter2 != null))
			{
				curObject.health -= 10;
				if (curObject.health < 0)
					removeObject(curObject);
				removeObject(object);
				break;
			}
		}
		object.x = newCoords.x;
		object.y = newCoords.y;
		if ((object.x > 500) || (object.y > 500) || (object.x < -500) || (object.y < -500))
			removeObject(object);
	}
	object.last_update = curTime;
}

function recalcType(type, curTime)
{
	for (var i in objects)
	{
		if (objects[i].type == type)
			recalcObject(objects[i], curTime);
	}
}

function recalc(curTime)
{
	for (var i in objects)
	{
		recalcObject(objects[i], curTime);
	}
}

function genEvent(object,type,curTime,params)
{
	var event = {type:type, params:params, cur_time:curTime, object:object.id, event_d: curTime - prevEventTime};
	prevEventTime = curTime;
	return event;
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
	exports.addObject = addObject;
	exports.genEvent = genEvent;
}
