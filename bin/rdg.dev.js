/**
 * random-dungeon-generator - v0.0.1
 * Copyright (c) 2014, Jorge Perez (http://www.jorgeprodriguez.me)
 * Compiled: 2014-03-12
 * random-dungeon-generator is licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
// random number generator

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
};

RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};

RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
};

RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};

RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
};


Cartography.NORTH = 0;
Cartography.EAST = 1;
Cartography.SOUTH = 2;
Cartography.WEST = 3;


Cartography.direction = function(orientation) {
	switch(orientation) {
		case Cartography.NORTH: return {'dx': 0, 'dy': -1};
		case Cartography.EAST: return {'dx': 1, 'dy': 0};
		case Cartography.SOUTH: return {'dx': 0, 'dy': 1};
		case Cartography.WEST: return {'dx': -1, 'dy': 0};
		default: return {'dx': 0, 'dy': 0};
	}
};

function Cartography() {};

// A star implementation

AStar.sort = function(a, b) {
    if (a.f > b.f) return 1;
    if (a.f < b.f) return -1;
    return 0;
};

AStar.manhattan = function(a, b) {
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
};

function AStar(stepCondition, goalCondition) {

	var layout;
	var startNode, goalNode, currentNode;
	var openNodes, closedNodes;
	var steps;


	function addOpenNode(n) {
		openNodes.push(n);
		openNodes.sort(AStar.sort);
	};


	function addClosedNode(n) {
		closedNodes.push(n);
	};


	function removeOpenNode(n) {
	    for(var i = 0, l = openNodes.length; i < l; i++) {
	        if (openNodes[i] === n) 
	        	return openNodes.splice(i, 1);
	    }
	    return false;
	};


	function inOpenNodes(n) {
		for(var i = 0, l = openNodes.length; i < l; i++) {
			var openNode = openNodes[i];
			if(openNode.x === n.x && openNode.y === n.y)
				return openNode;
		}
		return false;
	};


	function inClosedNodes(n) {
		for(var i = 0, l = closedNodes.length; i < l; i++) {
			var closedNode = closedNodes[i];
			if(closedNode.x === n.x && closedNode.y === n.y)
				return closedNode;
		}
		return false;
	};


	function neighborNodes(n) {
		var neighborhood = [];

		for(var i = 0; i < 4; i++) {
			var dir = Cartography.direction(i);

			try {
				for(var j = 1; j <= steps; j++) {
					var step = layout[n.x+j*dir.dx][n.y+j*dir.dy];

					if(!that.stepCondition(step.x, step.y))
						break;

					if(j === steps) {
						neighborhood.push({
							'x': step.x, 
							'y': step.y,
							'parent': n,
							'dir': dir,
							'g': n.g+AStar.manhattan(n, step), 
							'h': AStar.manhattan(step, goalNode),
							'f': n.g+AStar.manhattan(n, step)+AStar.manhattan(step, goalNode)});						
					}
				}
			} catch(e) {
				continue;	// out of bounds
			}
		}

		return neighborhood;
	};


	function isGoal(n) {
		return that.goalCondition(n.x, n.y, goalNode.x, goalNode.y);
	};


	function expandNode() {
		if(openNodes.length === 0) 
			return false;

		currentNode = openNodes[0];

		if(isGoal(currentNode)) 
			return true;

		removeOpenNode(currentNode);
		addClosedNode(currentNode);

		var neighborhood = neighborNodes(currentNode);

		for(var i = 0, l = neighborhood.length; i < l; i++) {
			var neighbor = neighborhood[i];

			var closedNode = inClosedNodes(neighbor);
			if(closedNode && neighbor.g > closedNode.g)
				continue;

			var openNode = inOpenNodes(neighbor);
			if(!openNode || neighbor.g < openNode.g) {
				if(!openNode) addOpenNode(neighbor);
				else openNode = neighbor;
			}
		}

		return(expandNode());
	};


	this.searchPath = function(aStarLayout, start, goal, stepSize) {
		layout = aStarLayout;
		steps = stepSize;

		startNode = {
			'x': start.x, 
			'y': start.y, 
			'parent': null, 
			'dir': null,
			'g': 0, 
			'h': AStar.manhattan(start, goal), 
			'f': AStar.manhattan(start, goal)};

		goalNode = {
			'x': goal.x, 
			'y': goal.y, 
			'parent': null, 
			'dir': null,
			'g': 0, 
			'h': 0, 
			'f': 0};

		openNodes = [];
		closedNodes = [];

		addOpenNode(startNode);
		
		return expandNode();
	};


	this.buildPath = function() {
		var path = [];
	    var node = currentNode;

	    path.push(node);

	    while(node.parent) {
	        path.push(node.parent);
	        node = node.parent;
	    } 

	    return path;
	};


	this.stepCondition = stepCondition;
	this.goalCondition = goalCondition;

	// This is used to make the object available to the private methods
	var that = this;
};

	
Cell.BLOCKED = 0;
Cell.EMPTY = 1;
Cell.ROOM = 2;
Cell.PERIMETER = 3;
Cell.DOOR = 4;
Cell.CORRIDOR = 5;
Cell.DEADEND = 6;
Cell.STAIRS = 7;

function Cell(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.room = null;
	this.connected = false;
};


function Stairs(x, y, up) {
	this.x = x;
	this.y = y;
	this.up = up;
};


function Door(x, y, orientation, interior) {
	this.x = x;
	this.y = y;
	this.orientation = orientation;
	this.interior = interior;
};


function Room(id, x, y, w, h) {
	this.id = id;
	this.inix = x;
	this.iniy = y;
	this.width = w;
	this.height = h;
	this.doors = [];
};

function Floor(width, height, type) {

// Layout-related functions

	function setLayoutType(type) {
		switch(type) {
			default:
				for(var x = 0; x < that.width; x++) {
					for(var y = 0; y < that.height; y++) {
						if(x === 0 || x === (that.layout.length-1) || y === 0 || y === (that.layout[x].length-1))
							that.layout[x][y] = new Cell(x, y, Cell.BLOCKED);
						else that.layout[x][y] = new Cell(x, y, Cell.EMPTY);
					}
				}				
				break;
		}		
	};

// Generation functions

	function generate() {
		var density = DENSITY; 	// optimal values are in the range of [2, 5]

		var minrsize = MIN_ROOM_SIZE;
		var maxrsize = turnOdd(Math.round(Math.max(that.width-2, that.height-2)/density));

		if(maxrsize < minrsize) 
			maxrsize = minrsize;

		// place rooms
		generateRooms(minrsize, maxrsize);
		// place doors
		generateDoors(minrsize, maxrsize);
		// connect rooms
		generateCorridors();
		// place dead ends
		generateDeadEnds();
		// place entrance and exit
		generateStairs();
	};


	function generateRooms(minrsize, maxrsize) {
		var xmin = 3; 
		var xmax = that.layout.length-minrsize;
		var ymin = 3; 
		var ymax = that.layout[0].length-minrsize;

		var nrooms = Math.round(((that.width-2)*(that.height-2))/Math.pow(maxrsize, 2));

		while(that.rooms.length === 0) {
			for(var i = 0; i < nrooms; i++) {
				var inix = turnOdd(rnd.nextRange(xmin, xmax+1));
				var iniy = turnOdd(rnd.nextRange(ymin, ymax+1));

				var rwidth = turnOdd(rnd.nextRange(minrsize, maxrsize+1));
				var rheight = turnOdd(rnd.nextRange(minrsize, maxrsize+1));

				if(rwidth < minrsize) rwidth = minrsize;
				if(rheight < minrsize) rheight = minrsize;

				if((inix+rwidth) > xmax) rwidth = (xmax-inix);
				if((iniy+rheight) > ymax) rheight = (ymax-iniy);

				if((rwidth < minrsize) || (rheight < minrsize)) continue;

				if(room4room(inix, iniy, rwidth, rheight)) {
					var room = new Room(that.rooms.length, inix, iniy, rwidth, rheight);

					insertRoom(room);
					that.rooms.push(room);
				}				
			}
		}
	};


	function insertRoom(room) {
		for(var x = (room.inix-1), lx = (room.inix+room.width+1); x < lx; x++) {
			for(var y = (room.iniy-1), ly = (room.iniy+room.height+1); y < ly; y++) {
				if (x === (room.inix-1) || x === (room.inix+room.width) || 
					y === (room.iniy-1) || y === (room.iniy+room.height)) {
					if(that.layout[x][y].type !== Cell.BLOCKED) that.layout[x][y].type = Cell.PERIMETER;
				}
				else {
					that.layout[x][y].type = Cell.ROOM;
					that.layout[x][y].room = room;
				}
			}
		}
	};


	function generateDoors(minrsize, maxrsize) {
		for(var i = 0, l = that.rooms.length; i < l; i++) {
			var room = that.rooms[i];
			var maxdoors = Math.round((room.width*room.height)/Math.pow(minrsize, 2));
			var ndoors = rnd.nextRange(1, maxdoors);

			insertDoors(room, ndoors);
		}		
	};


	function insertDoors(room, ndoors) {
		while(ndoors > 0) {
			var x, y, nx, ny, lx, ly, rx, ry;
			var orientation = rnd.nextRange(0, 4);

			switch(orientation) {
				case Cartography.NORTH: 
					x = turnOdd(rnd.nextRange(room.inix, room.inix+room.width-1));
					y = room.iniy-1;
					nx = x; ny = y-1;
					lx = x-1; ly = y;
					rx = x+1; ry = y;
					break;
				case Cartography.EAST: 
					x = room.inix+room.width;
					y = turnOdd(rnd.nextRange(room.iniy, room.iniy+room.height-1));
					nx = x+1; ny = y;
					lx = x; ly = y-1;
					rx = x; ry = y+1;					
					break;
				case Cartography.SOUTH: 
					x = turnOdd(rnd.nextRange(room.inix, room.inix+room.width-1));
					y = room.iniy+room.height;	
					nx = x; ny = y+1;
					lx = x-1; ly = y;
					rx = x+1; ry = y;					
					break;
				case Cartography.WEST: 
					x = room.inix-1;
					y = turnOdd(rnd.nextRange(room.iniy, room.iniy+room.height-1));
					nx = x-1; ny = y;
					lx = x; ly = y-1;
					rx = x; ry = y+1;					
					break;
			}

			if ((that.layout[x][y].type === Cell.PERIMETER) && (that.layout[nx][ny].type !== Cell.BLOCKED) &&
				(that.layout[lx][ly].type === Cell.PERIMETER) && (that.layout[rx][ry].type === Cell.PERIMETER)) {

				var interior = false;

				if(that.layout[nx][ny].type !== Cell.ROOM) ndoors--;
				else interior = true;	

				room.doors.push(new Door(x, y, orientation, interior));				
				that.layout[x][y].type = Cell.DOOR;			
			}
		}
	};


	function generateCorridors() {
		// There is a scenario where a room can't be connected to others because something (other rooms, perimeters, etc) 
		// is blocking all the possible paths. Because of this we can't rely on the expandCorridorsFrom function solely, 
		// so i use allRoomsConnected to ensure all the rooms are connected (although probably some are unreachable).
		while(!allRoomsConnected()) {	
			var room =  that.rooms[rnd.nextRange(0, that.rooms.length)];
			expandCorridorsFrom(room);
		}
	};


	function expandCorridorsFrom(room) {
		if(that.layout[room.inix][room.iniy].connected) {
			return;
		} else {
			for(var x = room.inix, lx = room.inix+room.width; x < lx; x++) {
				for(var y = room.iniy, ly = room.iniy+room.height; y < ly; y++) {
					that.layout[x][y].connected = true;
				}
			}			
		} 
		
		for(var i = 0, l = room.doors.length; i < l; i++) {
			var fromDoor = room.doors[i];
			var dir = Cartography.direction(fromDoor.orientation);

			that.layout[fromDoor.x][fromDoor.y].connected = true;

			if(fromDoor.interior) {
				var otherRoom = that.layout[fromDoor.x+dir.dx][fromDoor.y+dir.dy].room;

				if(!that.layout[otherRoom.inix][otherRoom.iniy].connected)
					expandCorridorsFrom(otherRoom);
			} else {
				if(that.rooms.length <= 1) {
					var deadend = getDeadEnd();

					that.layout[deadend.x][deadend.y].connected = connectDoors(fromDoor, deadend, dir); 	
				} else {
					var otherRoom = getUnconnectedRoom();

					if(!otherRoom) {
						var sameRoom = true;
						while(sameRoom) {
							otherRoom = that.rooms[rnd.nextRange(0, that.rooms.length)];
							sameRoom = (otherRoom === room);
						}
					}

					var toDoor = otherRoom.doors[rnd.nextRange(0, otherRoom.doors.length)];

					while(toDoor.interior) 
						toDoor = otherRoom.doors[rnd.nextRange(0, otherRoom.doors.length)];

					if(connectDoors(fromDoor, toDoor, dir)) {
						that.layout[toDoor.x][toDoor.y].connected = true;
						expandCorridorsFrom(otherRoom);
					} 						
				}
			}			
		}
	};


	function connectDoors(start, goal, dir) {	
		start = that.layout[start.x+dir.dx][start.y+dir.dy];

		if(start.type === Cell.EMPTY) {
			start.type = Cell.CORRIDOR;
			start.connected = true;
		}			

		var connected = aStar.searchPath(that.layout, start, goal, 2);
		takeWalk(aStar.buildPath());

		return connected;
	};


	function generateDeadEnds() {
		var nDeadEnds = rnd.nextRange(0, that.rooms.length);

		for(var i = 0; i < nDeadEnds; i++) {
			var corridorCell = getCorridorCell();
			var deadEnd = getDeadEnd();

			if(!corridorCell || !deadEnd) {
				return;
			} else {
				if(aStar.searchPath(that.layout, corridorCell, deadEnd, 2)){
					takeWalk(aStar.buildPath());
					that.layout[deadEnd.x][deadEnd.y].type = Cell.DEADEND;
					that.layout[deadEnd.x][deadEnd.y].connected = true;
					that.deadEnds.push(deadEnd);
				}
			}
		}
	};


	function getCorridorCell() {
		var inix = turnOdd(rnd.nextRange(0, that.width));
		var iniy = turnOdd(rnd.nextRange(0, that.height));

		for(var x = 0; x < that.width; x+=2) {
			for(var y = 0; y < that.height; y+=2){
				var startx = (inix+x)%(that.width-1);
				var starty = (iniy+y)%(that.height-1);
				if(that.layout[startx][starty].type === Cell.CORRIDOR && that.layout[startx][starty].connected)
					return that.layout[startx][starty];
			}
		}
		return false;
	};


	function getDeadEnd() {
		var inix = turnOdd(rnd.nextRange(0, that.width));
		var iniy = turnOdd(rnd.nextRange(0, that.height));

		for(var x = 0; x < that.width; x+=2) {
			for(var y = 0; y < that.height; y+=2){
				var deadx = (inix+x)%(that.width-1);
				var deady = (iniy+y)%(that.height-1);
				if(that.layout[deadx][deady].type === Cell.EMPTY && isolatedCell(deadx, deady))
					return that.layout[deadx][deady];
			}
		}
		return false;
	};


	function generateStairs() {
		insertStairs(false);
		insertStairs(true);
	};


	function insertStairs(up) {
		var inserted = false;

		while(!inserted) {
			var index = rnd.nextRange(0, that.deadEnds.length+that.rooms.length);

			if(index < that.deadEnds.length) {
				inserted = insertStairsInDeadEnd(that.deadEnds[index], up);
			} else {
				index = index-that.deadEnds.length;
				inserted = insertStairsInRoom(that.rooms[index], up);
			}
		}
	};


	function insertStairsInDeadEnd(deadEnd, up) {
		if(deadEnd.type === Cell.STAIRS)
			return false;

		deadEnd.type = Cell.STAIRS;

		var stairs = new Stairs(deadEnd.x, deadEnd.y, up);
		that.stairs.push(stairs);

		return true;			
	};


	function insertStairsInRoom(room, up) {
		if(roomContainsStairs(room))
			return false;

		var index = rnd.nextRange(0, (room.width)*(room.height));
		var x = room.inix+index%room.width;
		var y = room.iniy+Math.floor(index/room.width)

		var cell = that.layout[x][y];

		if(cell.type === Cell.STAIRS)
			return false;

		for(var i = 0; i < 4; i++) {
			var dir = Cartography.direction(i);
			var neighborCell = that.layout[x+dir.dx][y+dir.dy];
			if(neighborCell.type === Cell.DOOR)
				return false;
		}

		cell.type = Cell.STAIRS;

		var stairs = new Stairs(x, y, up);
		that.stairs.push(stairs);

		return true;				
	};


	function isolatedCell(x, y) {
		for(var i = 0; i < 4; i++) {
			var dir = Cartography.direction(i);
			var cell = that.layout[x+dir.dx][y+dir.dy];
			if(cell.type !== Cell.EMPTY && cell.type !== Cell.BLOCKED)
				return false;
		}
		return true;
	};


	function allRoomsConnected() {
		for(var i = 0, l = that.rooms.length; i < l; i++) {
			var room = that.rooms[i];
			if(!that.layout[room.inix][room.iniy].connected)
				return false;
		}
		return true;
	};


	function getUnconnectedRoom() {
		for(var i = 0, l = that.rooms.length; i < l; i++) {
			var room = that.rooms[i];
			if(!that.layout[room.inix][room.iniy].connected)
				return room;
		}
		return false;
	};


	function room4room(inix, iniy, w, h) {
		for(var x = inix, lx = (inix+w); x < lx; x++) {
			for(var y = iniy, ly = (iniy+h); y < ly; y++) {
				if(that.layout[x][y].type != Cell.EMPTY) return false;
			}
		}
		return true;
	};


	function roomContainsStairs(room) {
		for(var x = room.inix, lx = room.inix+room.width; x < lx; x++) {
			for(var y = room.iniy, ly = room.iniy+room.height; y < ly; y++) {
				var cell = that.layout[x][y];
				if(cell.type === Cell.STAIRS)
					return true;
			}
		}
		return false;
	};


	function takeSteps(x, y, dir) {
		var firstStep = that.layout[x+dir.dx][y+dir.dy];
		var secondStep = that.layout[x+2*dir.dx][y+2*dir.dy];

		if(!firstStep.connected) {
			firstStep.type = Cell.CORRIDOR;
			firstStep.connected = true;		
		}

		if(!secondStep.connected) {
			secondStep.type = Cell.CORRIDOR;
			secondStep.connected = true;
		} else {
			if(secondStep.type === Cell.DEADEND) {
				for(var i = 0, l = that.deadEnds.length; i < l; i++) {
					var deadEnd = that.deadEnds[i];
					if(deadEnd.x === secondStep.x && deadEnd.y === secondStep.y) {
						that.deadEnds.splice(i, 1);
						break;
					}
				}

				secondStep.type = Cell.CORRIDOR;
			}
		}
	};	


	function takeWalk(steps) {
		for(var i = steps.length-1; i > 0; i--) {
			var node = steps[i];
			var dir = steps[i-1].dir;
			
			takeSteps(node.x, node.y, dir);
		}
	};


	function turnOdd(n) {
		return Math.abs((n%2===0)?(n-1):n);
	};


	var MIN_FLOOR_WIDTH = 9;
	var MIN_FLOOR_HEIGHT = 9;
	var MIN_ROOM_SIZE = 3;
	var DENSITY = 4;

	var rnd = new RNG(Date.now());

	this.width = (width < MIN_FLOOR_WIDTH) ? MIN_FLOOR_WIDTH : turnOdd(width); 
	this.height = (height < MIN_FLOOR_HEIGHT) ? MIN_FLOOR_HEIGHT : turnOdd(height); 
	this.type = type;

	this.rooms = [];
	this.deadEnds = [];
	this.stairs = [];

	this.layout = new Array(this.width);

	for(var x = 0; x < this.width; x++)
		this.layout[x] = new Array(this.height);

	var stepCondition = function(x, y) {
		var type = that.layout[x][y].type;
		return((type === Cell.EMPTY) || (type === Cell.CORRIDOR) || (type === Cell.DOOR) || (type === Cell.DEADEND));
	};

	var goalCondition = function(x, y, gx, gy) {
		if(gx === x && gy === y)	// dead end check
			return true;

		for(var i = 0; i < 4; i++) {	// doors check
			var dir = Cartography.direction(i);
			if(gx === x+dir.dx && gy === y+dir.dy)	
				return true;
		}

		return false;
	};

	var aStar = new AStar(stepCondition, goalCondition);
	var that = this;

	setLayoutType(type);
	generate();
};


function Dungeon() {

	this.floors = [];


	this.addFloor = function(width, height, type) {
		this.floors.push(new Floor(width, height, type));
	};


	this.addMultipleFloors = function(n, width, height, type) {
		for(var i = 0; i < n; i++) {
			this.addFloor(width, height, type);
		}
	};


	this.draw = function(index, canvas, grid) {
		var floor = this.floors[index];
		var sqsize = 20;

		canvas.width = sqsize*floor.width;
		canvas.height = sqsize*floor.height;

		var ctx = canvas.getContext('2d');

		for(var x = 0; x < floor.width; x++) {
			for(var y = 0; y < floor.height; y++) {
				switch(floor.layout[x][y].type) {
					case(Cell.BLOCKED):
						ctx.fillStyle = COLOR_EMPTY;
						break;
					case(Cell.EMPTY):
						ctx.fillStyle = COLOR_EMPTY;
						break;
					case(Cell.ROOM):
						ctx.fillStyle = COLOR_ROOM;
						break;
					case(Cell.PERIMETER):
						ctx.fillStyle = COLOR_EMPTY;
						break;
					case(Cell.DOOR):
						ctx.fillStyle = COLOR_DOOR;
						break;
					case(Cell.CORRIDOR):
						ctx.fillStyle = COLOR_ROOM;
						break;
					case(Cell.DEADEND):
						ctx.fillStyle = COLOR_ROOM;
						break;
					case(Cell.STAIRS):
						ctx.fillStyle = COLOR_STAIRS;
						break;
				}

				ctx.fillRect(sqsize*x, sqsize*y, sqsize, sqsize);

				if(grid) {
					ctx.rect(sqsize*x, sqsize*y, sqsize, sqsize);
					ctx.stroke();	
				}				
			}
		}
	};


	var COLOR_BLOCKED = '#CF5C60';
	var COLOR_EMPTY = '#344A5F';
	var COLOR_ROOM = '#F0F1F2';
	var COLOR_PERIMETER = '#717ECD';
	var COLOR_DOOR = '#F3AE4E';	
	var COLOR_CORRIDOR = '#4AB471';
	var COLOR_DEADEND = '#4EB1CB';
	var COLOR_STAIRS = '#CF5C60';

};
