// TABLE CLASS CONSTRUCTOR

LT.Table = function (element) {
  for (var i = 0; i < LT.Table.properties.length; i++) {
    var property = LT.Table.properties[i];
    if (property == "name" || property == "grid_color") {
      this[property] = decodeURIComponent(element.getAttribute(property)); // strings
    }
    else {
      this[property] = parseInt(element.getAttribute(property)); // integers
    }
  }
};

//  TABLE PROPERTIES

LT.Table.properties = ["id", "user_id", "image_id", "name",
  "tile_rows", "tile_columns", "tile_width", "tile_height",
  "grid_width", "grid_height", "grid_thickness", "grid_color",
  "piece_stamp", "tile_stamp", "message_stamp"];

// CLIENT-SERVER COMMUNICATION

LT.Table.prototype.update = function (mods) {
  var args = {}
  for (var i = 0; i < LT.Table.properties.length; i++) {
    var property = LT.Table.properties[i];
    if (typeof(mods[property]) == "undefined") {
      args[property] = this[property];
    }
    else {
      args[property] = mods[property];
    }
  }
  args.table_id = args.id;
  delete(args.id);
  LT.ajaxRequest("POST", "php/update_table.php", args, function () {return;});
}

LT.Table.prototype.remove = function () {
  var args = {table_id: this.id};
  LT.ajaxRequest("POST", "php/delete_table.php", args, function () {return;});
}

// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)

LT.Table.prototype.getName = function () {return this.name;};
LT.Table.prototype.setName = function (newName) {
  this.update({name: newName});
};

LT.Table.prototype.getUserID = function () {return this.user_id};
LT.Table.prototype.setUserID = function (newUserID) {
  this.update({user_id: newUserID});
};

LT.Table.prototype.getImageID = function () {return this.image_id};
LT.Table.prototype.setImageID = function (newImageID) {
  this.update({image_id: newImageID});
};

LT.Table.prototype.getGridWidth = function () {return this.grid_width;};
LT.Table.prototype.setGridWidth = function (newWidth) {
  this.update({grid_width: newWidth});
};

LT.Table.prototype.getGridHeight = function () {return this.grid_height;};
LT.Table.prototype.setGridHeight = function (newHeight) {
  this.update({grid_height: newHeight});
};

LT.Table.prototype.getGridThickness = function () {return this.grid_thickness;};
LT.Table.prototype.setGridThickness = function (newThickness) {
  this.update({grid_thickness: newThickness});
};

LT.Table.prototype.getGridColor = function () {return this.grid_color;};
LT.Table.prototype.setGridColor = function (newColor) {
  this.update({grid_color: newColor});
};


