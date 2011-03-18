LT.Image = function (element) {
  var self = this;
  // Use array notation instead of dot notation for properties
  // because one of the properties (public) is a reserved keyword.
  for (var i = 0; i < LT.Image.properties.length; i++) {
    var property = LT.Image.properties[i];
    if (property == "file" || property == "type" || property == "tile_mode") {
      this[property] = decodeURIComponent(element.getAttribute(property)); // strings
    }
    else {
      this[property] = parseInt(element.getAttribute(property)); // integers
    }
  }
};

LT.Image.prototype.getURL = function () {
  return 'images/upload/' + this.type + '/' + this.file;
};

LT.Image.properties = ['id', 'file', 'type', 'user_id', 'public', 'width',
  'height', 'tile_width', 'tile_height', 'center_x', 'center_y', 'tile_mode'];

LT.Image.prototype.update = function (mods) {
  var args = {};
  for (var i = 0; i < LT.Image.properties.length; i++) {
    var property = LT.Image.properties[i];
    if (typeof(mods[property]) != "undefined") {
      this[property] = mods[property];
    }
    args[property] = this[property];
  }
  args.image_id = args.id;
  delete(args.id);
  LT.ajaxRequest("POST", "php/update_image.php", args, function () {return;});
};

LT.Image.prototype.remove = function () {
  var args = {image_id: this['id']};
  LT.ajaxRequest("POST", "php/delete_image.php", args, function () {return;});
};


