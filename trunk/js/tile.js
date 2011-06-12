// TILE CONSTRUCTOR
LT.Tile = function (tableID, x, y, tileCode) {
  this.table_id = tableID;
  this.x = x;
  this.y = y;
  this.fog = parseInt(tileCode[0]);
  this.image_id = parseInt(tileCode.slice(1));
  this.createImage();
  this.createClickableElement();
};

// GLOBAL VARIABLES
LT.Tile.PROPERTIES = ["fog", "image_id", "x", "y", "table_id"];
LT.Tile.dragging = 0;

// METHODS OF TILE OBJECTS
LT.Tile.prototype = {

  // CLIENT-SERVER COMMUNICATION
  update: function (mods) {
    var args = {}
    for (var i = 0; i < LT.Tile.PROPERTIES.length; i++) {
      var property = LT.Tile.PROPERTIES[i];
      if (typeof(mods[property]) != "undefined") {
        this[property] = mods[property];
      }
      args[property] = this[property];
    }
    LT.ajaxRequest("POST", "php/update_tile.php", args, function () {return;});
  },
  remove: function () {
    var args = {table_id: this.id, x: this.x, y: this.y};
    LT.ajaxRequest("POST", "php/delete_tile.php", args, function () {return;});
  },

  // PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)
  getImageID: function () {return this.image_id;},
  setImageID: function (newImageID) {
    this.update({image_id: newImageID});
    this.createImage();
  },
  hasFog: function () {return this.fog == 1;},
  makeFog: function () {this.update({fog: 1});},
  clearFog: function () {this.update({fog: 0});},

  // CREATE A PROPERLY SCALED AND POSITIONED IMAGE
  createImage: function () {
    // if the tile already has an image, remove it
    if (this.image) {
      this.image.parentNode.removeChild(this.image);
      delete(this.image);
    }
    // if the tile is not empty, create an image
    if (this.image_id != -1) {
      var image = LT.tileImages[this.image_id];
      var tile_width = LT.currentTable.tile_width;
      var tile_height = LT.currentTable.tile_height;
      var xScale = tile_width /  image.tile_width;
      var yScale = tile_height / image.tile_height;
      var image_width = Math.round(image.width * xScale);
      var image_height = Math.round(image.height * yScale);
      var margin_left = -Math.round(image.center_x * xScale);
      var margin_top = -Math.round(image.center_y * yScale);
      var left = Math.round((this.x + 0.5) * tile_width);
      var top = Math.round((this.y + 0.5) * tile_height);
      this.image = LT.element('img', {'src' : image.getURL(),
        'style': 'position: absolute; left: ' + left + 'px; top: ' + top + 'px; '
        + 'width: ' + image_width + 'px; height: ' + image_height + 'px; '
        + 'margin-left: ' + margin_left + 'px; margin-top: ' + margin_top + 'px; '},
        LT.tileLayer);
    }
  },

  // CREATE AN ELEMENT YOU CAN CLICK ON TO CHANGE THE TILE
  createClickableElement: function () {
    var tile_width = LT.currentTable.tile_width;
    var tile_height = LT.currentTable.tile_height;
    this.clickDiv = LT.element('div', {'style': 'position: absolute; '
      + 'left: ' + (this.x * tile_width) + 'px; top: ' + (this.y * tile_height) + 'px; '
      + 'width: ' + tile_width + 'px; height: ' + tile_height + 'px; '},
      LT.clickTileLayer);
    var self = this;
    this.clickDiv.onmousedown = function() {
      LT.Tile.dragging = 1;
      self.setImageID(LT.selectedImageID);
    };
    this.clickDiv.onmouseover = function() {
      if (LT.Tile.dragging == 1) {
        self.setImageID(LT.selectedImageID);
	  }
    };
  },
};

