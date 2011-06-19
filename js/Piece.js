// PIECE CONSTRUCTOR
LT.Piece = function (element) {
  for (var i = 0; i < LT.Piece.PROPERTIES.length; i++) {
    var property = LT.Piece.PROPERTIES[i];
    if (property == "name" || property == "color") {
      this[property] = decodeURIComponent(element.getAttribute(property)); // strings
    }
    else {
      this[property] = parseInt(element.getAttribute(property)); // integers
    }
  }
  this.stats = {};
  var statNodes = element.getElementsByTagName("stat");
  for (var j = 0; j < statNodes.length; j++) {
    var statName = decodeURIComponent(statNodes[j].getAttribute("name"));
    var statValue = decodeURIComponent(statNodes[j].textContent);
    this.stats[statName] = statValue;
  }
};

// GLOBAL VARIABLES
LT.Piece.PROPERTIES = ["id", "user_id", "image_id", "table_id", "name", 
  "x", "y", "x_offset", "y_offset", "height", "width", "color"];

// METHODS OF PIECE OBJECTS
LT.Piece.prototype = {

  // CLIENT-SERVER COMMUNICATION

  update: function (mods) {
    var args = {}
    for (var i = 0; i < LT.Piece.PROPERTIES.length; i++) {
      var property = LT.Piece.PROPERTIES[i];
      if (typeof(mods[property]) != "undefined") {
        this[property] = mods[property];
      }
      args[property] = this[property];
    }
    args.piece_id = args.id;
    delete(args.id);
    LT.ajaxRequest("POST", "php/update_piece.php", args, function () {return;});
  },

  remove: function () {
    var args = {piece_id: this.id};
    LT.ajaxRequest("POST", "php/delete_piece.php", args, function () {return;});
  },

  // PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)

  getName: function () {return this.name;},
  setName: function (newName) {
    this.update({name: newName});
  },

  getColor: function () {return this.color;},
  setColor: function (newColor) {
    this.update({color: newColor});
  },
  getPosition: function () {return [this.x, this.y];},
  setPosition: function (newX, newY) {
    this.update({x: newX, y: newY});
  },

  getOffset: function () {return [this.x_offset, this.y_offset];},
  setOffset: function (newX, newY) {
    this.update({x_offset: newX, y_offset: newY});
  },

  getSize: function () {return [this.width, this.height];},
  setSize: function (newWidth, newHeight) {
    this.update({width: newWidth, height: newHeight});
  },

  getUserID: function () {return this.user_id},
  setUserID: function (newUserID) {
    this.update({user_id: newUserID});
  },

  getImageID: function () {return this.image_id},
  setImageID: function (newImageID) {
    this.update({image_id: newImageID});
  },

  getTableID: function () {return this.table_id},
  setTableID: function (newTableID) {
    this.update({table_id: newTableID});
  },

  // STATS

  getStat: function (statName) {return this.stats[statName]},
  setStat: function (statName, newValue) {
    var args = {piece_id: this.id, name: statName, value: newValue};
    LT.ajaxRequest("POST", "php/update_stat.php", args, function () {return;});
  },
  deleteStat: function (statName) {
    var args = {piece_id: this.id, name: statName};
    LT.ajaxRequest("POST", "php/delete_stat.php", args, function () {return;});
  },

  // GAME-SPECIFIC HOOKS

  /*
  The character sheet script generates a DOM node representing a character's
  stats. For example the stats {"toughness":"5","hit_points":"3"} could be 
  rendered as "5 toughness, 2 tgh/2, 3/5 hit points" or it something more visual.
  The character sheet node is displayed (perhaps in a panel?) when you select a
  piece. Only one character sheet is shown at a time.

  The default character sheet script simply lists the stats as a 2 column table.
  */
  characterSheet: function () {
    var table = LT.element("table", {});
    var tbody = LT.element("tbody", {}, table);
    for (var statName in this.stats) {
      var row = LT.element("tr", {}, tbody);
      LT.element("td", {}, row, statName);
      LT.element("td", {}, row, this.stats[statName]);
    }
    return table;
  },

  /*
  The piece decoration script generates a DOM node representing a character's
  stats, like the character sheet, but focused on showing temporary status 
  graphically with health bars and icons. This DOM node is shown for all pieces,
  whether or not they are selected.
  
  The default piece decoration script just shows the piece's name:
  */
  decoration: function () {
    return document.createTextNode(this.name);
  },

}


