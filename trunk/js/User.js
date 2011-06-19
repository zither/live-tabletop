// USER CONSTRUCTOR
LT.User = function (element) {
  this.id = parseInt(element.getAttribute("id"));
  for (var i = 0; i < LT.User.PROPERTIES.length; i++) {
    var property = LT.User.PROPERTIES[i];
    this[property] = decodeURIComponent(element.getAttribute(property));
  }
}

// GLOBAL VARIABLES
LT.User.PROPERTIES = ["color", "name", "permissions"];

// METHODS OF USER OBJECTS
LT.User.prototype = {

  update: function (mods) {
    var args = {user_id: this.id};
    for (var i = 0; i < LT.User.PROPERTIES.length; i++) {
      var property = LT.User.PROPERTIES[i];
      if (typeof(mods[property]) != "undefined") {
        this[property] = mods[property];
      }
      args[property] = this[property];
    }
    LT.ajaxRequest("POST", "update_user.php", args, function () {return;});
  },

  remove: function () {
    var args = {user_id: this.id};
    LT.ajaxRequest("POST", "delete_user.php", args, function () {return;});
  },

}

