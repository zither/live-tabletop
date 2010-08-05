/*

 code   fog     right    bottom
 ----  ------   -----    ------
  0    no fog   clear    clear
  1     fog      wall     wall
  2              door     door

*/

// TILE CLASS CONSTRUCTOR

LT.Tile = function (tableID, x, y, tileCode) {
  this.table_id = tableID;
  this.x = x;
  this.y = y;
  this.fog = parseInt(tileCode[0]);
  this.right = parseInt(tileCode[1]);
  this.bottom = parseInt(tileCode[2]);
  this.image_id = parseInt(tileCode.slice(3));
};

// CLIENT-SERVER COMMUNICATION

LT.Tile.prototype.update = function (mods) {
  var args = {table_id: this.table_id, x: this.x, y: this.y,
    fog: typeof(mods.fog) == "undefined" ? this.fog : mods.fog,
    right: typeof(mods.right) == "undefined" ? this.right : mods.right,
    bottom: typeof(mods.bottom) == "undefined" ? this.bottom : mods.bottom,
    image_id: typeof(mods.image_id) == "undefined" ? this.image_id : mods.image_id
  };    
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

LT.Tile.prototype.hasRightWall = function () {return this.right == 1;};
LT.Tile.prototype.hasRightDoor = function () {return this.right == 2;};
LT.Tile.prototype.makeRightWall = function () {this.update({right: 1});};
LT.Tile.prototype.makeRightDoor = function () {this.update({right: 2});};
LT.Tile.prototype.clearRightWall = function () {this.update({right: 0});};

LT.Tile.prototype.hasBottomWall = function () {return this.bottom == 1;};
LT.Tile.prototype.hasBottomDoor = function () {return this.bottom == 2;};
LT.Tile.prototype.makeBottomWall = function () {this.update({bottom: 1});};
LT.Tile.prototype.makeBottomDoor = function () {this.update({bottom: 2});};
LT.Tile.prototype.clearBottomWall = function () {this.update({bottom: 0});};

