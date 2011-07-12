// TABLE CONSTRUCTOR
LT.Table = function (element) {
  for (var i = 0; i < LT.Table.PROPERTIES.length; i++) {
    var property = LT.Table.PROPERTIES[i];
    var value = element.getAttribute(property);
    if (property == "name"
     || property == "grid_color"
     || property == "wall_color"
     || property == "tile_mode") {
      this[property] = decodeURIComponent(value); // strings
    }
    else {
      this[property] = parseInt(value); // integers
    }
  }
};

// GLOBAL VARIABLES
LT.Table.PROPERTIES = ["id", "user_id", "image_id", "name",
  "tile_rows", "tile_columns", "tile_width", "tile_height",
  "grid_thickness", "grid_color", "wall_thickness", "wall_color",
  "piece_stamp", "tile_stamp", "message_stamp", "tile_mode"];

LT.Table.presets = [];

// STATIC FUNCTIONS
LT.Table.loadPresets = function () {
  var request = LT.ajaxRequest("GET", "../presets.xml", {});
  var elements = request.responseXML.getElementsByTagName("preset");
  for (var i = 0; i < elements.length; i++) {
    LT.Table.presets.push({
      name: elements[i].getAttribute("name"),
      mode: elements[i].getAttribute("mode"),
      width: parseInt(elements[i].getAttribute("width")),
      height: parseInt(elements[i].getAttribute("height")),
    });
  }
};

// METHODS OF TABLE OBJECTS
LT.Table.prototype = {

  // CLIENT-SERVER COMMUNICATION

  update: function (mods) {
    var args = {}
    for (var i = 0; i < LT.Table.PROPERTIES.length; i++) {
      var property = LT.Table.PROPERTIES[i];
      if (typeof(mods[property]) != "undefined") {
        this[property] = mods[property];
      }
      args[property] = this[property];
    }
    args.table_id = args.id;
    delete(args.id);
    LT.ajaxRequest("POST", "php/update_table.php", args, function () {return;});
  },
  
  remove: function () {
    var args = {table_id: this.id};
    LT.ajaxRequest("POST", "php/delete_table.php", args, function () {return;});
  },
  
  // PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)
  
  getName: function () {return this.name;},
  setName: function (newName) {
    this.update({name: newName});
  },
  
  getUserID: function () {return this.user_id},
  setUserID: function (newUserID) {
    this.update({user_id: newUserID});
  },
  
  getImageID: function () {return this.image_id},
  setImageID: function (newImageID) {
    this.update({image_id: newImageID});
  },
  
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
	LT.fill(LT.wallLayer);

    // Add a new grid to the wall layer.
    this.grid = new LT.Grid(this.tile_columns, this.tile_rows,
      this.tile_width, this.tile_height, this.grid_thickness, this.grid_color,
      this.wall_thickness, this.wall_color, this.tile_mode, LT.wallLayer);

    // Load the wall data from the server.
    var self = this;
    var args = {table_id: this.id};
    LT.ajaxRequest("POST", "php/read_walls.php", args, function (ajax) {
      var walls = ajax.responseXML.getElementsByTagName("wall");
      for (var i = 0; i < walls.length; i++) {
        var column = parseInt(walls[i].getAttribute("x"));
        var row = parseInt(walls[i].getAttribute("y"));
        var direction = decodeURIComponent(walls[i].getAttribute("direction"));
        var contents = decodeURIComponent(walls[i].getAttribute("contents"));
        if (contents == "wall") {
          self.grid.wall(column, row, direction);
        }
        if (contents == "door") {
          self.grid.door(column, row, direction);
        }
      }
      self.createGridClickDetectors();
    });

  },

  createGridClickDetectors: function () {
    // Remove any existing grid click detectors.
	LT.fill(LT.clickWallLayer);
    // Add new click detectors for each tile.
    for (var row = 0; row < this.tile_rows; row++) {
      for (var column = 0; column < this.tile_columns; column++) {
        if (this.tile_mode == 'rectangle') {
          this.createGridClickDetector(column, row, "n",  1/4, -1/4, 1/2, 1/2);
          this.createGridClickDetector(column, row, "w", -1/4,  1/4, 1/2, 1/2);
          if (row == this.tile_rows - 1) {
            this.createGridClickDetector(column, row, "s",  1/4,  3/4, 1/2, 1/2);
          }
          if (column == this.tile_columns - 1) {
            this.createGridClickDetector(column, row, "e",  3/4,  1/4, 1/2, 1/2);
          }
        }
        if (this.tile_mode == 'isometric') {
          var offset = (row % 2) / 2;
          this.createGridClickDetector(column, row, "ne", offset + 1/2, 0, 1/2, 1);
          this.createGridClickDetector(column, row, "nw", offset,       0, 1/2, 1);
          if (row == this.tile_rows - 1) {
            this.createGridClickDetector(column, row, "se", offset + 1/2, 1, 1/2, 1);
            this.createGridClickDetector(column, row, "sw", offset,       1, 1/2, 1);
          }
          else {
            if (column == 0 && row % 2 == 0) {
              this.createGridClickDetector(column, row, "sw", offset,       1, 1/2, 1);
            }
            if (column == this.tile_columns - 1 && row % 2 == 1) {
              this.createGridClickDetector(column, row, "se", offset + 1/2, 1, 1/2, 1);
            }
          }
        }
        if (this.tile_mode == 'hex rows') {
          var offset = (row % 2) / 2;
          this.createGridClickDetector(column, row, "ne", offset + 1/2,  0,  1/2, 1/3);
          this.createGridClickDetector(column, row, "e",  offset + 3/4, 1/3, 1/2, 2/3);
          this.createGridClickDetector(column, row, "se", offset + 1/2,  1,  1/2, 1/3);
          this.createGridClickDetector(column, row, "sw", offset,        1,  1/2, 1/3);
          this.createGridClickDetector(column, row, "w",  offset - 1/4, 1/4, 1/2, 2/3);
          this.createGridClickDetector(column, row, "nw", offset,        0,  1/2, 1/3);
        }
        if (this.tile_mode == 'hex columns') {
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
    var clickDiv = LT.element("div", {style: "position: absolute;"
      + "left: " + (this.tile_width  * (column + left)) + "px;"
      + "top: " + (this.tile_height * (row + top)) + "px;"
      + "width: " + (this.tile_width  * width) + "px;"
      + "height: " + (this.tile_height * height) + "px;"
      }, LT.clickWallLayer);
    var self = this;
    clickDiv.onclick = function () {
      self.click(column, row, direction);
    }
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
      contents: type};
    if (type != "door" && type != "wall") {
      LT.ajaxRequest("POST", "php/delete_wall.php", args, function () {return;});
    }
    else {
      LT.ajaxRequest("POST", "php/create_wall.php", args, function () {return;});
    }
  },
  
  wall: function(column, row, direction) {
    this.setWall(column, row, direction, "wall");
  },
  
  door: function(column, row, direction) {
    this.setWall(column, row, direction, "door");
  },
  
  clear: function(column, row, direction) {
    this.setWall(column, row, direction, "none");
  },

}


