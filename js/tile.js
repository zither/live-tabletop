// TILE CLASS CONSTRUCTOR

LT.Tile = function (tableID, x, y, tileCode) {
  this.table_id = tableID;
  this.x = x;
  this.y = y;
  this.fog = parseInt(tileCode[0]);
  this.image_id = parseInt(tileCode.slice(1));
};

// TILE PROPERTIES

LT.Tile.properties = ["fog", "image_id"];

// CLIENT-SERVER COMMUNICATION

LT.Tile.prototype.update = function (mods) {
  var args = {}
  for (var i = 0; i < LT.Tile.properties.length; i++) {
    var property = LT.Tile.properties[i];
    if (typeof(mods[property]) != "undefined") {
      this[property] = mods[property];
    }
    args[property] = this[property];
  }
  LT.ajaxRequest("POST", "php/update_tile.php", args, function () {return;});
}

LT.Tile.prototype.remove = function () {
  var args = {table_id: this.id, x: this.x, y: this.y};
  LT.ajaxRequest("POST", "php/delete_tile.php", args, function () {return;});
}

// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)

LT.Tile.prototype.getImageID = function () {return this.image_id;};
LT.Tile.prototype.setImageID = function (newImageID) {
  this.update({image_id: newImageID});
};

LT.Tile.prototype.hasFog = function () {return this.fog == 1;};
LT.Tile.prototype.makeFog = function () {this.update({fog: 1});};
LT.Tile.prototype.clearFog = function () {this.update({fog: 0});};

