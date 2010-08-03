LT.Image = function (element) {
  this.id = parseInt(element.getAttribute("id"));
  this.file = element.getAttribute("file");
  this.type = element.getAttribute("type");
  this.user_id = parseInt(element.getAttribute("user_id"));
  this.public = element.getAttribute("public") != "0";
};

LT.Image.prototype.update = function (newUserID, newPublic) {
  var args = {
    image_id: this.id,
    user_id: typeof(newUserID) == "number" ? newUserID : this.user_id,
    public: typeof(newPublic) == "boolean" ? newPublic : this.public
  };
  LT.ajaxRequest("POST", "php/update_image.php", args, function () {return;});
}

LT.Image.prototype.delete = function () {
  var args = {image_id: this.id};
  LT.ajaxRequest("POST", "php/delete_image.php", args, function () {return;});
};


