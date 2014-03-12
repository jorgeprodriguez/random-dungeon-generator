
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
