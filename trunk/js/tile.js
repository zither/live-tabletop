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
    // remove the image
    if (this.image) {
      this.image.parentNode.removeChild(this.image);
      delete(this.image);
    }
    // if the tile is not empty, create a new image
    if (this.image_id != -1) {
      var image = LT.tileImages[this.image_id];
      var tile_width = LT.currentTable.tile_width;
      var tile_height = LT.currentTable.tile_height;
      // scaling factors = current table scale / original image scale
      var xScale = tile_width /  image.tile_width;
      var yScale = tile_height / image.tile_height;
      // stretch image dimensions
      var image_width = Math.round(image.width * xScale);
      var image_height = Math.round(image.height * yScale);
      // stretch center coordinates, and invert them as negative margins
      var margin_left = -Math.round(image.center_x * xScale);
      var margin_top = -Math.round(image.center_y * yScale);
      // position relative to center of tile by adding half a tile width
      var left = Math.round((this.x + 0.5) * tile_width);
      var top = Math.round((this.y + 0.5) * tile_height);
      // create the new image element
      this.image = LT.element('img', {'src' : image.getURL(),
        'style': 'position: absolute; left: ' + left + 'px; top: ' + top + 'px; '
        + 'width: ' + image_width + 'px; height: ' + image_height + 'px; '
        + 'margin-left: ' + margin_left + 'px; margin-top: ' + margin_top + 'px; '});
      // create as many new sub-layers as needed
      for (var i = LT.tileLayer.childNodes.length; i < image.layer + 1; i++) {
        LT.element('div', {}, LT.tileLayer);
      }
      // add the new image to the appropriate sub-layer
      var layer = LT.tileLayer.childNodes.item(image.layer);
      layer.appendChild(this.image);
      // sort the nodes in this layer by row then column
      var nodes = [];
      while (layer.hasChildNodes()) {
        nodes.push(layer.removeChild(layer.firstChild));
      }
      // if b.style.top - a.style.top is 0, the OR operator ||
      // will treat that as false and return b.style.left - a.style.left
      nodes.sort(function(a, b) {
        return parseInt(b.style.top) - parseInt(a.style.top)
          || parseInt(b.style.left) - parseInt(a.style.left);
      });
      for (i = 0; i < nodes.length; i++) {
        layer.appendChild(nodes[i]);
      }
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

