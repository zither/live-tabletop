LT.Image = function (element) {
  // Use array notation instead of dot notation for properties
  // because one of the properties (public) is a reserved keyword.
  this['id'] = parseInt(element.getAttribute("id"));
  this['file'] = decodeURIComponent(element.getAttribute("file"));
  this['type'] = decodeURIComponent(element.getAttribute("type"));
  this['user_id'] = parseInt(element.getAttribute("user_id"));
  this['public'] = element.getAttribute("public") != "0";
};

LT.Image.prototype.update = function (newUserID, newPublic) {
  var args = {
    'image_id': this['id'],
    'user_id': typeof(newUserID) == "number" ? newUserID : this['user_id'],
    'public': typeof(newPublic) == "boolean" ? newPublic : this['public']
  };
  LT.ajaxRequest("POST", "php/update_image.php", args, function () {return;});
}

LT.Image.prototype.remove = function () {
  var args = {image_id: this['id']};
  LT.ajaxRequest("POST", "php/delete_image.php", args, function () {return;});
};


