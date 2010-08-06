LT.Image = function (element) {
  var self = this;
  // Use array notation instead of dot notation for properties
  // because one of the properties (public) is a reserved keyword.
  self['id'] = parseInt(element.getAttribute("id"));
  self['file'] = decodeURIComponent(element.getAttribute("file"));
  self['type'] = decodeURIComponent(element.getAttribute("type"));
  self['user_id'] = parseInt(element.getAttribute("user_id"));
  self['public'] = element.getAttribute("public") != "0";
  // get the height and width of the image
  self.sample = LT.element("img", {src: self.getURL()});
  self.sample.onload = function () {
    self.width = self.sample.width;
    self.height = self.sample.height;
  };
};

LT.Image.prototype.getURL = function () {
  return 'images/upload/' + this.type + '/' + this.file;
};

LT.Image.prototype.update = function (newUserID, newPublic) {
  var args = {
    'image_id': this['id'],
    'user_id': typeof(newUserID) == "number" ? newUserID : this['user_id'],
    'public': typeof(newPublic) == "boolean" ? newPublic : this['public']
  };
  LT.ajaxRequest("POST", "php/update_image.php", args, function () {return;});
};

LT.Image.prototype.remove = function () {
  var args = {image_id: this['id']};
  LT.ajaxRequest("POST", "php/delete_image.php", args, function () {return;});
};


