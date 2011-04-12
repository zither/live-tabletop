// TILE CLASS CONSTRUCTOR
LT.tileDragging = 0;

LT.Tile = function (tableID, x, y, tileCode) {
  this.table_id = tableID;
  this.x = x;
  this.y = y;
  this.fog = parseInt(tileCode[0]);
  this.image_id = parseInt(tileCode.slice(1));
  var tWidth = LT.currentTable.tile_width;
  var tHeight = LT.currentTable.tile_height;
  var tBackground = '';
  if (this.image_id >= 0) {
    tBackground = LT.tileImages[this.image_id].file;
  }
  this.clickDiv = LT.element('div', {'style': 'position: absolute; left: ' + (x * tWidth)
    + 'px; top: ' + (y * tHeight) + 'px; width: ' + tWidth + 'px; height: ' + tHeight + 'px; '},
    LT.clickLayer);
  this.imageDiv = LT.element('div', {'style': 'position: absolute; left: ' + (x * tWidth)
    + 'px; top: ' + (y * tHeight) + 'px; width: ' + tWidth + 'px; height: ' + tHeight + 'px; ' +    
	' background: url(images/upload/tile/' + tBackground + ');'},
    LT.tileLayer);
  var self = this;
  this.clickDiv.onclick = function (){

  }
  this.clickDiv.onmousedown = function() {
    LT.tileDragging = 1;
    self.imageDiv.style.backgroundImage = 'url(\'images/upload/tile/' + LT.selectedImage + '\')';
    self.setImageID(LT.selectedImageID);
  };
  this.clickDiv.onmouseover = function() {
    if (LT.tileDragging == 1){
	  self.imageDiv.style.backgroundImage = 'url(\'images/upload/tile/' + LT.selectedImage + '\')';
      self.setImageID(LT.selectedImageID);
	}
  };
  //this.clickDiv = ;
};

// TILE PROPERTIES

LT.Tile.properties = ["fog", "image_id", "x", "y", "table_id"];

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

