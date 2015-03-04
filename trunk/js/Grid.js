// GRID CONSTRUCTOR
LT.Grid = function (columns, rows, width, height, thickness, color, wall_thickness, wall_color, door_thickness, door_color, type, parent) {
	this._type = type;
	this._width = width;
	this._height = height;
	this._thickness = thickness;
	this._color = color || "black";
	this._wall_thickness = wall_thickness;
	this._wall_color = wall_color || "black";
	this._door_thickness = door_thickness;
	this._door_color = door_color || "black";
	this.canvas = document.createElement("canvas");
	if (parent) parent.appendChild(this.canvas);
	this.canvas.className = "grid";
	this.walls = [];
	this.resize(columns, rows);
};

LT.Grid.prototype = {

	// CONSTANTS

	SHAPES: {
		"square": {
			directions: {n: 0, e: 1, s: 2, w: 3},
			points: [[0, 0], [1, 0], [1, 1], [0, 1]]},
		"hex": {
			directions: {n: 0, ne: 1, se: 2, s: 3, sw: 4, nw: 5},
			points: [[1/3, 0], [1, 0], [4/3, 1/2], [1, 1], [1/3, 1], [0, 1/2]]}},

	// METHODS OF GRID OBJECTS

	repaint: function () {

		var context = this.canvas.getContext("2d");
		var points = this.SHAPES[this._type].points;
		var thickness = Math.max(this._thickness, this._wall_thickness,
			this._door_thickness + 2 * Math.max(1, this._thickness));

		// resize canvas to fit grid lines, walls and doors
		this.canvas.width = (this.getColumns() + (this._type == "hex" ? 1/3 : 0))
			* this._width + thickness;
		this.canvas.height = (this.getRows() + (this._type == "hex" ? 1/2 : 0))
			* this._height + thickness;

		// offset coordinate system to center of grid lines
		context.translate(thickness / 2 - this._width, thickness / 2 - this._height);
		this.canvas.style.marginLeft = -thickness / 2 + "px";
		this.canvas.style.marginTop = -thickness / 2 + "px";

		// draw grid
		if (this._thickness) {
			context.strokeStyle = this._color;
			context.lineWidth = this._thickness;
			context.beginPath();
			for (var column = 1; column <= this.getColumns(); column++) {
				var stagger = this._type == "hex" ? 0.5 * (column % 2) : 0;
				for (var row = 1; row <= this.getRows(); row++) {
					context.moveTo(
						(points[0][0] + column) * this._width,
						(points[0][1] + row + stagger) * this._height);
					for (var i = 1; i < points.length; i++) {
						context.lineTo(
							(points[i][0] + column) * this._width,
							(points[i][1] + row + stagger) * this._height);
					}
					context.closePath();
				}
			}
			context.stroke();
		}

		if (this._wall_thickness) {
			// draw walls
			for (var column = 0; column <= this.getColumns(); column++) {
				var stagger = this._type == "hex" ? 0.5 * (column % 2) : 0;
				for (var row = 0; row <= this.getRows(); row++) {
					for (var direction in this.walls[row][column]) {
						if (this.walls[row][column][direction] == "wall") {
							var i = this.SHAPES[this._type].directions[direction];
							if (typeof(i) == "undefined") continue;
							var j = (i + 1) % points.length;
							var x1 = (points[i][0] + column) * this._width;
							var y1 = (points[i][1] + row + stagger) * this._height;
							var x2 = (points[j][0] + column) * this._width;
							var y2 = (points[j][1] + row + stagger) * this._height;
							if (row == 0 && direction == "ne") { // vertical wrap
								y1 += this.walls.length * this._height;
								y2 += this.walls.length * this._height;
							}
							context.lineCap = "round";
							context.strokeStyle = this._wall_color;
							context.lineWidth = this._wall_thickness;
							context.beginPath();
							context.moveTo(x1, y1);
							context.lineTo(x2, y2);
							context.stroke();
						}
					}
				}
			}
			// draw doors
			for (var column = 0; column <= this.getColumns(); column++) {
				var stagger = this._type == "hex" ? 0.5 * (column % 2) : 0;
				for (var row = 0; row <= this.getRows(); row++) {
					for (var direction in this.walls[row][column]) {
						if (this.walls[row][column][direction] == "door") {
							var i = this.SHAPES[this._type].directions[direction];
							if (typeof(i) == "undefined") continue;
							var j = (i + 1) % points.length;
							var x1 = (points[i][0] + column) * this._width;
							var y1 = (points[i][1] + row + stagger) * this._height;
							var x2 = (points[j][0] + column) * this._width;
							var y2 = (points[j][1] + row + stagger) * this._height;
							if (row == 0 && direction == "ne") { // vertical wrap
								y1 += this.walls.length * this._height;
								y2 += this.walls.length * this._height;
							}
							context.lineCap = "butt";
							context.strokeStyle = this._wall_color;
							context.lineWidth = this._door_thickness + 2 * Math.max(1, this._thickness);
							context.beginPath();
							context.moveTo(x1, y1);
							context.lineTo(x2, y2);
							context.stroke();
							var r = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
							var t = this._thickness / r;
							var x3 = (x1 + t * x2) / (1 + t);
							var y3 = (y1 + t * y2) / (1 + t);
							var x4 = (t * x1 + x2) / (1 + t);
							var y4 = (t * y1 + y2) / (1 + t);
							context.strokeStyle = this._door_color;
							context.lineWidth = this._door_thickness;
							context.beginPath();
							context.moveTo(x3, y3);
							context.lineTo(x4, y4);
							context.stroke();
						}
					}
				}
			}
		} // if (this._wall_thickness) {
	},

	resize: function (columns, rows) {
		while (this.walls.length < rows + 1) this.walls.push([]);
		while (this.walls.length > rows + 1) this.walls.pop();
		for (var row = 0; row < rows + 1; row++) {
			while (this.walls[row].length < columns + 1) this.walls[row].push({});
			while (this.walls[row].length > columns + 1) this.walls[row].pop();
		}
	},

	getColumns: function () {
		return this.walls[0].length - 1;
	},

	setColumns: function (columns) {
		this.resize(columns, this.getRows());
	},

	getRows: function () {
		return this.walls.length - 1;
	},

	setRows: function (rows) {
		this.resize(this.getColumns(), rows);
	},

	getType: function () {return this._type;},

	setType: function (type) {
		this._type = type;
		this.reset();
	},

	getColor: function () {return this._color;},
	getThickness: function () {return this._thickness;},
	getWallColor: function () {return this._wall_color;},
	getWallThickness: function () {return this._wall_thickness;},
	getDoorColor: function () {return this._door_color;},
	getDoorThickness: function () {return this._door_thickness;},
	getWidth: function () {return this._width;},
	getHeight: function () {return this._height;},

	setColor: function (value) {this._color = value;},
	setThickness: function (value) {this._thickness = value;},
	setWallColor: function (value) {this._wall_color = value;},
	setWallThickness: function (value) {this._wall_thickness = value;},
	setDoorColor: function (value) {this._door_color = value;},
	setDoorThickness: function (value) {this._door_thickness = value;},
	setWidth: function (value) {this._width = value;},
	setHeight: function (value) {this._height = value;},

	// normalize walls to avoid redundancy
	normalize: function (column, row, direction) {
		switch (direction) {
			case "n": direction = "s"; row--; break;
			case "w": direction = "e"; column--; break;
			case "nw": direction = "se"; column--; row += column % 2; row++; break;
			case "sw": direction = "ne"; column--; row += column % 2; break;
		}
		return {column: column, row: row, direction: direction};
	},

	getWall: function (column, row, direction) {
		var c = this.normalize(column, row, direction);
		return this.walls[c.row][c.column][c.direction];
	},

	setWall: function (column, row, direction, type) {
		var c = this.normalize(column, row, direction);
		if (type != "door" && type != "wall") {
			delete(this.walls[c.row][c.column][c.direction]);
		}
		else {
			this.walls[c.row][c.column][c.direction] = type;
		}
	},

	wall: function (column, row, direction) {
		this.setWall(column, row, direction, "wall");
	},

	door: function (column, row, direction) {
		this.setWall(column, row, direction, "door");
	},

	clear: function (column, row, direction) {
		this.setWall(column, row, direction, "none");
	},

	reset: function () {
		var rows = this.getRows();
		var columns = this.getColumns();
		this.walls = [];
		this.resize(columns, rows);
	},

};


