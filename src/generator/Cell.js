	
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
