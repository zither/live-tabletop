// MAP CONSTRUCTOR
LT.Map = function (data) {
	for (var i = 0; i < LT.Map.PROPERTIES.length; i++)
		this[LT.Map.PROPERTIES[i]] = data[LT.Map.PROPERTIES[i]];
};


// GLOBAL VARIABLES

LT.Map.PROPERTIES = ["id", "user_id", "image_id", "name",
	"tile_rows", "tile_columns", "tile_width", "tile_height",
	"grid_thickness", "grid_color", "wall_thickness", "wall_color",
	"piece_stamp", "tile_stamp", "message_stamp", "tile_mode"
];

LT.Map.images = {};

LT.Map.presets = [];


// STATIC FUNCTIONS

// TODO: load this from static config file
LT.Map.readImages = function () {
	$.post("php/read_images.php", {type: "background"}, function (data) {
		LT.Map.images = {};
		for (var i = 0; i < data.length; i++) {
			LT.Map.images[data[i].id] = new LT.Image(data[i]);
			$("#mapEditor [name=image_id], #mapCreator [name=image_id]")
				.append($("<option>").attr("value", data[i].id)
				.text(data[i].file.slice(0, -4))); // remove file extension
		}
	}, "json");
};


// METHODS OF TABLE OBJECTS
LT.Map.prototype = {

	// CLIENT-SERVER COMMUNICATION

	update: function (mods) {
		var args = LT.applyChanges(this, mods, LT.Map.PROPERTIES);
		return $.post("php/Map.settings.php", args);
	},
	
	remove: function () {
		return $.post("php/Map.disown.php", {campaign: this.id});
	},
	
	// TODO: Map.read reads more than just tiles
	loadTiles: function () {
		var self = this;
		$.post("php/Map.read.php", {table_id: this.id}, function (data) {
			$("#tileLayer, #clickTileLayer, #fogLayer").empty();
			$("#map, #clickWallLayer").css({
				width: self.tile_width * self.tile_columns + "px",
				height: self.tile_height * self.tile_rows + "px",
			});
			var columns = self.tile_columns;
			LT.tiles = [];
			for (var i = 0; i < data.images.length; i++)
				LT.tiles.push(new LT.Tile({
					table_id: self.id,
					x: i % columns,
					y: Math.floor(i / columns),
					image_id: data.images[i],
					fog: parseInt(data.fog[i]),
				}));
		}, "json");
	},

	// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)
	
	getName: function () {return this.name;},
	setName: function (newName) {this.update({name: newName});},
	
	getUserID: function () {return this.user_id},
	setUserID: function (newUserID) {this.update({user_id: newUserID});},
	
	getImageID: function () {return this.image_id},
	setImageID: function (newImageID) {this.update({image_id: newImageID});},
	
	getTileWidth: function () {return this.tile_width;},
	setTileWidth: function (newWidth) {
		this.update({tile_width: newWidth});
		if (this.grid) this.grid.setWidth(newWidth);
	},
	
	getTileHeight: function () {return this.tile_height;},
	setTileHeight: function (newHeight) {
		this.update({tile_height: newHeight});
		if (this.grid) this.grid.setHeight(newHeight);
	},
	
	getGridThickness: function () {return this.grid_thickness;},
	setGridThickness: function (newThickness) {
		this.update({grid_thickness: newThickness});
		if (this.grid) this.grid.setThickness(newThickness);
	},
	
	getGridColor: function () {return this.grid_color;},
	setGridColor: function (newColor) {
		this.update({grid_color: newColor});
		if (this.grid) this.grid.setColor(newColor);
	},
	
	getWallThickness: function () {return this.wall_thickness;},
	setWallThickness: function (newThickness) {
		this.update({wall_thickness: newThickness});
		if (this.grid) this.grid.setWallThickness(newThickness);
	},
	
	getWallColor: function () {return this.wall_color;},
	setWallColor: function (newColor) {
		this.update({wall_color: newColor});
		if (this.grid) this.grid.setWallColor(newColor);
	},
	
	getTileMode: function () {return this.tile_mode;},
	setTileMode: function (newMode) {
		this.update({tile_mode: newMode});
		if (this.grid) this.grid.setMode(newMode);
	},

	// GRID FUNCTIONS
	
	createGrid: function () {

		// Remove any grid which is currently in the wall layer.
		$("#wallLayer").empty();

		// Add a new grid to the wall layer.
		this.grid = new LT.Grid(this.tile_columns, this.tile_rows,
			this.tile_width, this.tile_height, this.grid_thickness, this.grid_color,
			this.wall_thickness, this.wall_color, this.tile_mode, $("#wallLayer")[0]);

		// Load the wall data from the server.
		var self = this;
		$.post("php/read_walls.php", {table_id: this.id}, function (data) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].contents == "wall")
					self.grid.wall(data[i].x, data[i].y, data[i].direction);
				if (data[i].contents == "door")
					self.grid.door(data[i].x, data[i].y, data[i].direction);
			}
			self.createGridClickDetectors();
		});

	},

	createGridClickDetectors: function () {
		// Remove any existing grid click detectors.
		$("#clickWallLayer").empty();
		// Add new click detectors for each tile.
		for (var row = 0; row < this.tile_rows; row++) {
			for (var column = 0; column < this.tile_columns; column++) {
				if (this.tile_mode == "rectangle") {
					this.createGridClickDetector(column, row, "n",  1/4, -1/4, 1/2, 1/2);
					this.createGridClickDetector(column, row, "w", -1/4,  1/4, 1/2, 1/2);
					if (row == this.tile_rows - 1)
						this.createGridClickDetector(column, row, "s",  1/4,  3/4, 1/2, 1/2);
					if (column == this.tile_columns - 1)
						this.createGridClickDetector(column, row, "e",  3/4,  1/4, 1/2, 1/2);
				}
				if (this.tile_mode == "isometric") {
					var offset = (row % 2) / 2;
					this.createGridClickDetector(column, row, "ne", offset + 1/2, 0, 1/2, 1);
					this.createGridClickDetector(column, row, "nw", offset,       0, 1/2, 1);
					if (row == this.tile_rows - 1) {
						this.createGridClickDetector(column, row, "se", offset + 1/2, 1, 1/2, 1);
						this.createGridClickDetector(column, row, "sw", offset,       1, 1/2, 1);
					} else {
						if (column == 0 && row % 2 == 0)
							this.createGridClickDetector(column, row, "sw", offset,       1, 1/2, 1);
						if (column == this.tile_columns - 1 && row % 2 == 1)
							this.createGridClickDetector(column, row, "se", offset + 1/2, 1, 1/2, 1);
					}
				}
				if (this.tile_mode == "hex rows") {
					var offset = (row % 2) / 2;
					this.createGridClickDetector(column, row, "ne", offset + 1/2,  0,  1/2, 1/3);
					this.createGridClickDetector(column, row, "e",  offset + 3/4, 1/3, 1/2, 2/3);
					this.createGridClickDetector(column, row, "se", offset + 1/2,  1,  1/2, 1/3);
					this.createGridClickDetector(column, row, "sw", offset,        1,  1/2, 1/3);
					this.createGridClickDetector(column, row, "w",  offset - 1/4, 1/4, 1/2, 2/3);
					this.createGridClickDetector(column, row, "nw", offset,        0,  1/2, 1/3);
				}
				if (this.tile_mode == "hex columns") {
					var offset = (column % 2) / 2;
					this.createGridClickDetector(column, row, "n",  1/3, offset - 1/4, 2/3, 1/2);
					this.createGridClickDetector(column, row, "ne",  1,  offset,       1/3, 1/2);
					this.createGridClickDetector(column, row, "se",  1,  offset + 1/2, 1/3, 1/2);
					this.createGridClickDetector(column, row, "s",  1/3, offset + 3/4, 2/3, 1/2);
					this.createGridClickDetector(column, row, "sw",  0,  offset + 1/2, 1/3, 1/2);
					this.createGridClickDetector(column, row, "nw",  0,  offset,       1/3, 1/2);
				}
			}
		}
	},

	createGridClickDetector: function (column, row, direction, left, top, width, height) {
		var self = this;
		$("<div>").appendTo($("#clickWallLayer")).css({
			left: (this.tile_width	* (column + left)) + "px",
			top: (this.tile_height * (row + top)) + "px",
			width: (this.tile_width	* width) + "px",
			height: (this.tile_height * height) + "px",
		}).click(function () {
			self.click(column, row, direction);
		});
	},

	click: function (column, row, direction) {
		// TODO: depending on which tool is selected, call this.door(...) or this.clear(...)
		var type = this.getWall(column, row, direction);
		if (type == "wall") this.door(column, row, direction);
		else if (type == "door") this.clear(column, row, direction);
		else this.wall(column, row, direction);
	},

	getWall: function (column, row, direction) {
		return this.grid.getWall(column, row, direction);
	},
	
	setWall: function (column, row, direction, type) {
		this.grid.setWall(column, row, direction, type);
		var coordinates = this.grid.normalize(column, row, direction);
		var args = {
			table_id: this.id,
			x: coordinates.column,
			y: coordinates.row,
			direction: coordinates.direction,
			contents: type
		};
		if (type != "door" && type != "wall")
			$.post("php/delete_wall.php", args);
		else
			$.post("php/create_wall.php", args);
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

}


