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
