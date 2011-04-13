// TABLE CLASS CONSTRUCTOR

LT.Table = function (element) {
  for (var i = 0; i < LT.Table.properties.length; i++) {
    var property = LT.Table.properties[i];
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

//  TABLE PROPERTIES

LT.Table.properties = ["id", "user_id", "image_id", "name",
  "tile_rows", "tile_columns", "tile_width", "tile_height",
  "grid_thickness", "grid_color", "wall_thickness", "wall_color",
  "piece_stamp", "tile_stamp", "message_stamp", "tile_mode"];

LT.Table.prototype = {

  // CLIENT-SERVER COMMUNICATION

  update: function (mods) {
    var args = {}
    for (var i = 0; i < LT.Table.properties.length; i++) {
      var property = LT.Table.properties[i];
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
    while(LT.wallLayer.firstChild){
      LT.wallLayer.removeChild(LT.wallLayer.firstChild);
    }

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
        var x = parseInt(walls[i].getAttribute("x"));
        var y = parseInt(walls[i].getAttribute("y"));
        var direction = decodeURIComponent(walls[i].getAttribute("direction"));
        var contents = decodeURIComponent(walls[i].getAttribute("contents"));
        if (contents == "wall") {
          self.wall(y, x, direction);
        }
        if (contents == "door") {
          self.door(y, x, direction);
        }
      }
    });

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
    this.setWall(row, column, direction, "door");
  },
  
  clear: function(column, row, direction) {
    this.setWall(row, column, direction, "none");
  },

}


