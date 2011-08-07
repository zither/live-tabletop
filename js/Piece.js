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
  this.element = LT.element('div', {style : 'position: absolute; '
    + 'height: ' + this.height + 'px; ' + 'width: ' + this.width + 'px; '
    + 'left: ' + this.x + 'px; ' + 'top: ' + this.y + 'px; '}, LT.pieceLayer);
  var imageSource = LT.Piece.images[this.image_id];
  this.image = LT.element('img', {style:
    'margin-top: ' + this.y_offset + 'px; margin-left: ' + this.x_offset + 'px;',
    src : 'images/upload/piece/' + imageSource.file}, this.element);
  this.mover = LT.element('div', {
    title : this.name,
    style : 'position: absolute; opacity: 0.8; '
    + 'height: ' + imageSource.height + 'px; width: ' + imageSource.width + 'px; '
    + 'left: ' + this.x + 'px; top: ' + this.y + 'px; '
    + 'margin-left: ' + this.x_offset + 'px; margin-top: ' + this.y_offset + 'px; '
    }, LT.clickPieceLayer);
  if (LT.Piece.selected && this.id == LT.Piece.selected.id) {
    this.mover.style.border = '1px dashed black';
    this.mover.style.margin = (this.y_offset -1) + 'px 0px 0px '
      + (this.x_offset -1) + 'px';
  }
  if (LT.currentUser.id == LT.currentTable.user_id
   || LT.currentUser.id == this.user_id
   || LT.currentUser.permissions == 'administrator') {
    var self = this;
    this.mover.onmousedown = function () {
      LT.Piece.selected = self;
      LT.Piece.readStats();
      LT.Piece.editor.selected = self.image_id;
      for (i = 0; i < LT.pieces.length; i++) {
        LT.pieces[i].mover.style.border = '0px';
        LT.pieces[i].mover.style.margin =  LT.pieces[i].y_offset + 'px 0px 0px '
          + LT.pieces[i].x_offset + 'px';
      }
      self.element.style.background = '#FFF';
      self.mover.style.border = '1px dashed black';
      self.mover.style.margin = (self.y_offset -1) + 'px 0px 0px '
        + (self.x_offset -1) + 'px';
      LT.Piece.moving = true;
      return false; 
    };
    this.mover.onmouseover = function () { 
      self.element.style.background = '#FFF';
      return false;
    };
    this.mover.onmouseout = function () { 
      self.element.style.background = '';
      return false;
    };
  }

};

// GLOBAL VARIABLES
LT.Piece.PROPERTIES = ["id", "user_id", "image_id", "table_id", "name", 
  "x", "y", "x_offset", "y_offset", "height", "width", "color"];
LT.Piece.placing = false;
LT.Piece.moving = false;
LT.Piece.selected = null;
LT.Piece.images = {};
LT.Piece.editor = {};
LT.Piece.creator = {};


// STATIC FUNCTIONS
LT.Piece.stopDragging = function () {
  if (LT.Piece.moving) {
    LT.Piece.selected.place();
    LT.Piece.moving = false;
  }
};
LT.Piece.drag = function () {
  if (LT.Piece.moving) {
    LT.Piece.selected.move();
  }
};
LT.Piece.readImages = function () {
  var request = LT.ajaxRequest("POST", "php/read_images.php", {'type' : 'piece'});
  if (request.responseXML) {
    var imageElements = request.responseXML.getElementsByTagName('image');
    LT.Piece.images = {};
    for (var i = 0 ; i < imageElements.length; i++) {
      var image = new LT.Image(imageElements[i]);
      LT.Piece.images[image.id] = image;
    }
  }
};

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
    this.stats[statName] = newValue;
  },
  deleteStat: function (statName) {
    var args = {piece_id: this.id, name: statName};
    LT.ajaxRequest("POST", "php/delete_stat.php", args, function () {return;});
    delete(this.stats[statName]);
  },
  getStatNames: function () {
    var names = [];
    for (var statName in this.stats) {
      names.push(statName);
    }
    return names;
  },
  getStats: function () {
    var statObjects = [];
    for (var statName in this.stats) {
      statObjects.push({name: statName, value: this.stats[statName]});
    }
    return statObjects;
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


  place: function () {
    // was LT.getEditPiece()
    for (i = 0; i < LT.Piece.editor.userSelect.childNodes.length; i++) {
      var option = LT.Piece.editor.userSelect.childNodes[i];
      option.removeAttribute('selected');
    }
    for (i = 0; i < LT.Piece.editor.userSelect.childNodes.length; i++) {
      var option = LT.Piece.editor.userSelect.childNodes[i];
      if (LT.users[option.value].id == this.user_id) {
        option.setAttribute('selected', 'select');
      }
    }
    LT.Piece.editor.pName.value = this.name;
    LT.Piece.editor.x.value = this.x;
    LT.Piece.editor.y.value = this.y;
    LT.Piece.editor.xOff.value = this.x_offset;
    LT.Piece.editor.yOff.value = this.y_offset;
    LT.Piece.editor.wInput.value = this.width;
    LT.Piece.editor.hInput.value = this.height;

    // was LT.placePiece()
    this.x = parseInt(this.element.style.left);
    this.y = parseInt(this.element.style.top);
    this.update({});
  },

  move: function () {
    // was LT.movePiece()
    var w = parseInt(this.element.style.width);
    var h = parseInt(this.element.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.element.style.left);
      LT.clickY = LT.dragY - parseInt(this.element.style.top);
      LT.clickDragGap = 1;
    }
    var tableHeight = parseInt(LT.tabletop.style.height);
    var tableWidth = parseInt(LT.tabletop.style.width);
    LT.dragX = Math.min(LT.dragX - LT.clickX, tableWidth - w);
    LT.dragY = Math.min(LT.dragY - LT.clickY, tableHeight - h);
    LT.dragX = Math.max(LT.dragX, 0);
    LT.dragY = Math.max(LT.dragY, 0);
    if (LT.currentTable.tile_height) {
      var tileH = LT.currentTable.tile_height;
      var tileW = LT.currentTable.tile_width;
      LT.dragY = LT.dragY - (LT.dragY % tileH);
      LT.dragX = LT.dragX - (LT.dragX % tileW);
    }
    this.element.style.top  = LT.dragY + "px";
    this.element.style.left = LT.dragX + "px";
    this.mover.style.top  = LT.dragY + "px";
    this.mover.style.left = LT.dragX + "px";
  },

  edit: function () {
    // was LT.editPieceHandler()
    this.user_id = LT.users[LT.Piece.editor.userSelect.value].id;
    this.image_id = LT.Piece.editor.selected;
    this.name = LT.Piece.editor.pName.value;
    this.x = LT.Piece.editor.x.value;
    this.y = LT.Piece.editor.y.value
    this.x_offset = LT.Piece.editor.xOff.value;
    this.y_offset = LT.Piece.editor.yOff.value;
    this.width = LT.Piece.editor.wInput.value;
    this.height = LT.Piece.editor.hInput.value;
    this.update({});
  },

};


