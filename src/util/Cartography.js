
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
