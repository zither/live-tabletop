LT.User = function (element) {
  this.id = parseInt(element.getAttribute("id"));
  for (var i = 0; i < LT.User.properties.length; i++) {
    var property = LT.User.properties[i];
    this[property] = decodeURIComponent(element.getAttribute(property));
  }
}

LT.User.properties = ["color", "name", "permissions"];

LT.User.prototype.update = function (mods) {
  var args = {user_id: this.id};
  for (var i = 0; i < LT.User.properties.length; i++) {
    var property = LT.User.properties[i];
    if (typeof(mods[property]) == "undefined") {
      args[property] = this[property];
    }
    else {
      args[property] = mods[property];
    }
  }
  LT.ajaxRequest("POST", "update_user.php", args, function () {return;});
};

LT.User.prototype.remove = function () {
  var args = {user_id: this.id};
  LT.ajaxRequest("POST", "delete_user.php", args, function () {return;});
};

