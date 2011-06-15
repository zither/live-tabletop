// PIECE CLASS CONSTRUCTOR

LT.Piece = function (element) {
  for (var i = 0; i < LT.Piece.properties.length; i++) {
    var property = LT.Piece.properties[i];
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

// PIECE PROPERTIES

LT.Piece.properties = ["id", "user_id", "image_id", "table_id", "name", 
  "x", "y", "x_offset", "y_offset", "height", "width", "color"];

// CLIENT-SERVER COMMUNICATION

LT.Piece.prototype.update = function (mods) {
  var args = {}
  for (var i = 0; i < LT.Piece.properties.length; i++) {
    var property = LT.Piece.properties[i];
    if (typeof(mods[property]) != "undefined") {
      this[property] = mods[property];
    }
    args[property] = this[property];
  }
  args.piece_id = args.id;
  delete(args.id);
  LT.ajaxRequest("POST", "php/update_piece.php", args, function () {return;});
}

LT.Piece.prototype.remove = function () {
  var args = {piece_id: this.id};
  LT.ajaxRequest("POST", "php/delete_piece.php", args, function () {return;});
}

// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)

LT.Piece.prototype.getName = function () {return this.name;};
LT.Piece.prototype.setName = function (newName) {
  this.update({name: newName});
};

LT.Piece.prototype.getColor = function () {return this.color;};
LT.Piece.prototype.setColor = function (newColor) {
  this.update({color: newColor});
};
LT.Piece.prototype.getPosition = function () {return [this.x, this.y];};
LT.Piece.prototype.setPosition = function (newX, newY) {
  this.update({x: newX, y: newY});
};

LT.Piece.prototype.getOffset = function () {return [this.x_offset, this.y_offset];};
LT.Piece.prototype.setOffset = function (newX, newY) {
  this.update({x_offset: newX, y_offset: newY});
};

LT.Piece.prototype.getSize = function () {return [this.width, this.height];};
LT.Piece.prototype.setSize = function (newWidth, newHeight) {
  this.update({width: newWidth, height: newHeight});
};

LT.Piece.prototype.getUserID = function () {return this.user_id};
LT.Piece.prototype.setUserID = function (newUserID) {
  this.update({user_id: newUserID});
};

LT.Piece.prototype.getImageID = function () {return this.image_id};
LT.Piece.prototype.setImageID = function (newImageID) {
  this.update({image_id: newImageID});
};

LT.Piece.prototype.getTableID = function () {return this.table_id};
LT.Piece.prototype.setTableID = function (newTableID) {
  this.update({table_id: newTableID});
};

// STATS

LT.Piece.prototype.getStat = function (statName) {return this.stats[statName]};
LT.Piece.prototype.setStat = function (statName, newValue) {
  var args = {piece_id: this.id, name: statName, value: newValue};
  LT.ajaxRequest("POST", "php/update_stat.php", args, function () {return;});
};
LT.Piece.prototype.deleteStat = function (statName) {
  var args = {piece_id: this.id, name: statName};
  LT.ajaxRequest("POST", "php/delete_stat.php", args, function () {return;});
};

// GAME-SPECIFIC HOOKS

/*
The character sheet script generates a DOM node representing a character's
stats. For example the stats {"toughness":"5","hit_points":"3"} could be 
rendered as "5 toughness, 2 tgh/2, 3/5 hit points" or it something more visual.
The character sheet node is displayed (perhaps in a panel?) when you select a
piece. Only one character sheet is shown at a time.

The default character sheet script simply lists the stats as a 2 column table.
*/
LT.Piece.prototype.characterSheet = function () {
  var table = LT.element("table", {});
  var tbody = LT.element("tbody", {}, table);
  for (var statName in this.stats) {
    var row = LT.element("tr", {}, tbody);
    LT.element("td", {}, row, statName);
    LT.element("td", {}, row, this.stats[statName]);
  }
  return table;
};

/*
The piece decoration script generates a DOM node representing a character's
stats, like the character sheet, but focused on showing temporary status 
graphically with health bars and icons. This DOM node is shown for all pieces,
whether or not they are selected.

The default piece decoration script just shows the piece's name:
*/
LT.Piece.prototype.decoration = function () {
  return document.createTextNode(this.name);
};

// Move piece.
LT.movePiece = function () {
  var w = parseInt(LT.selectedPiece.pieceDiv.style.width);
  var h = parseInt(LT.selectedPiece.pieceDiv.style.height);
  if (LT.clickDragGap == 0) {
    LT.clickX = LT.dragX - parseInt(LT.selectedPiece.pieceDiv.style.left);
    LT.clickY = LT.dragY - parseInt(LT.selectedPiece.pieceDiv.style.top);
    LT.clickDragGap = 1;
  }
  var tableHeight = parseInt(LT.tableTop.style.height);
  var tableWidth = parseInt(LT.tableTop.style.width);
  LT.dragX = Math.min(LT.dragX - LT.clickX, tableWidth - w );
  LT.dragY = Math.min(LT.dragY - LT.clickY, tableHeight - h );
  LT.dragX = Math.max(LT.dragX, 0);
  LT.dragY = Math.max(LT.dragY, 0);
  LT.selectedPiece.pieceDiv.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceDiv.style.left = LT.dragX + "px";
  LT.selectedPiece.pieceImage.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceImage.style.left = LT.dragX + "px";
  LT.selectedPiece.movementPiece.style.top  = LT.dragY + "px";
  LT.selectedPiece.movementPiece.style.left = LT.dragX + "px";
}