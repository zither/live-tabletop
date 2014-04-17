// PIECE CONSTRUCTOR
LT.Piece = function (data) {
	for (var i = 0; i < LT.Piece.PROPERTIES.length; i++)
		this[LT.Piece.PROPERTIES[i]] = data[LT.Piece.PROPERTIES[i]];
	this.stats = data.stats;
	this.element = $("<div>").appendTo($("#pieceLayer")).css({
		height: this.height + "px",
		width: this.width + "px",
		left: this.x + "px",
		top: this.y + "px",
	}).addClass("piece").append(
		$("<img>").css({
			marginTop:  this.y_offset + "px",
			marginLeft: this.x_offset + "px",
		}).attr("src", "images/upload/piece/" + LT.Piece.images[this.image_id].file)
	);

	this.mover = $("<div>").appendTo("#clickPieceLayer").css({
		height: LT.Piece.images[this.image_id].height + "px",
		width:  LT.Piece.images[this.image_id].width  + "px",
		left: this.x + "px",
		top:  this.y + "px",
		marginLeft: (this.x_offset - 1) + "px",
		marginTop:  (this.y_offset - 1) + "px",
	}).attr("title", this.name).addClass("pieceMover");
	if (LT.Piece.selected && this.id == LT.Piece.selected.id)
		$(this.mover).addClass("selected");
	if (LT.currentUser.id == LT.currentTable.user_id
	 || LT.currentUser.id == this.user_id
	 || LT.currentUser.permissions == "administrator") {
		var self = this;
		$(this.mover).mousedown(function () {
			LT.Piece.selected = self;
			LT.Piece.readStats();
			LT.Piece.editor.selected = self.image_id;
			$(".pieceMover").removeClass("selected");
			$(self.element).addClass("selected");
			$(self.mover).addClass("selected");
			LT.Piece.moving = true;
			return false;
		}).mouseover(function () {
			$(self.element).addClass("selected");
			return false;
		}).mouseout(function () {
			$(self.element).removeClass("selected");
			return false;
		});
	}

};

// GLOBAL VARIABLES
LT.Piece.PROPERTIES = ["id", "user_id", "image_id", "table_id", "name",
	"x", "y", "x_offset", "y_offset", "height", "width", "color"];
LT.Piece.STRINGS = ["name", "color"];
LT.Piece.placing = false;
LT.Piece.moving = false;
LT.Piece.selected = null;
LT.Piece.images = {};
LT.Piece.editor = {};
LT.Piece.creator = {};


// STATIC FUNCTIONS
LT.dropHandlers.push(function () {
	if (LT.Piece.moving) {
		LT.Piece.selected.place();
		LT.Piece.moving = false;
	}
});

LT.dragHandlers.push(function () {
	if (LT.Piece.moving) LT.Piece.selected.move();
});

LT.Piece.readImages = function () {
	var request = $.post("php/read_images.php", {type: "piece"}, function (data) {
		// Create piece Image objects
		LT.Piece.images = {}
		for (var i = 0; i < data.length; i++)
			LT.Piece.images[data[i].id] = new LT.Image(data[i]);
		// Create piece image selectors (see piecesPanel.js)
		var sortedImages = LT.sortObject(LT.Piece.images, "file");
		for (var i = 0; i < sortedImages.length; i++)
			LT.createPieceImageSwatch(sortedImages[i]);
	}, "json");
};

// METHODS OF PIECE OBJECTS
LT.Piece.prototype = {

	// CLIENT-SERVER COMMUNICATION

	update: function (mods) {
		var args = LT.applyChanges(this, mods, LT.Piece.PROPERTIES, LT.Piece.STRINGS);
		return $.post("php/update_piece.php", args);
	},
	remove: function () {
		return $.post("php/delete_piece.php", {piece_id: this.id});
	},

	// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)

	getName: function () {return this.name;},
	setName: function (newName) {this.update({name: newName});},

	getColor: function () {return this.color;},
	setColor: function (newColor) {this.update({color: newColor});},

	getPosition: function () {return [this.x, this.y];},
	setPosition: function (newX, newY) {this.update({x: newX, y: newY});},

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
		$.post("php/update_stat.php", {piece_id: this.id, name: statName, value: newValue});
		this.stats[statName] = newValue;
	},
	deleteStat: function (statName) {
		$.post("php/delete_stat.php", {piece_id: this.id, name: statName});
		delete this.stats[statName];
	},
	getStatNames: function () {
		var names = [];
		for (var statName in this.stats) names.push(statName);
		return names;
	},
	getStats: function () {
		var statObjects = [];
		for (var statName in this.stats)
			statObjects.push({name: statName, value: this.stats[statName]});
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
		return $("<table>").append(
			$("<tbody>").append(
				$.map(this.stats, function (value, key) {
					return $("<tr>").append(
						$("<td").text(key),
						$("<td>").text(value)
					);
				})
			)
		)[0];
	},

	/*
	The piece decoration script generates a DOM node representing a character's
	stats, like the character sheet, but focused on showing temporary status
	graphically with health bars and icons. This DOM node is shown for all pieces,
	whether or not they are selected.

	The default piece decoration script just shows the piece's name:
	*/
	decoration: function () {
		return $("<div>").text(this.name);
	},

	// TODO: what does this do???
	place: function () {
		// was LT.getEditPiece()
		// TODO: function to populate form from an object's properties?
		$("#pieceCreator [name=owner]").val(this.user_id);
		$("#pieceCreator [name=name]").val(this.name);
		$("#pieceCreator [name=x]").val(this.x);
		$("#pieceCreator [name=y]").val(this.y);
		$("#pieceCreator [name=xOffset]").val(this.x_offset);
		$("#pieceCreator [name=yOffset]").val(this.y_offset);
		$("#pieceCreator [name=width]").val(this.width);
		$("#pieceCreator [name=height]").val(this.height);

		// was LT.placePiece()
		this.x = parseInt($(this.element).css("left"));
		this.y = parseInt($(this.element).css("top"));
		this.update({});
	},

	move: function () {
		// was LT.movePiece()
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX - parseInt($(this.element).css("left"));
			LT.clickY = LT.dragY - parseInt($(this.element).css("top"));
			LT.clickDragGap = 1;
		}
		var pieceWidth = parseInt($(this.element).css("width"));
		var pieceHeight = parseInt($(this.element).css("height"));
		var tableHeight = parseInt($("#map").css("height"));
		var tableWidth = parseInt($("#map").css("width"));
		LT.dragX = Math.min(LT.dragX - LT.clickX, tableWidth - pieceWidth);
		LT.dragY = Math.min(LT.dragY - LT.clickY, tableHeight - pieceHeight);
		LT.dragX = Math.max(LT.dragX, 0);
		LT.dragY = Math.max(LT.dragY, 0);
		if (LT.currentTable.tile_height) {
			LT.dragY = LT.dragY - (LT.dragY % LT.currentTable.tile_height);
			LT.dragX = LT.dragX - (LT.dragX % LT.currentTable.tile_width);
		}
		$(this.element).css({top: LT.dragY + "px", left: LT.dragX + "px"});
		$(this.mover).css({top: LT.dragY + "px", left: LT.dragX + "px"});
	},

	edit: function () {
		// was LT.editPieceHandler()
		this.update(LT.formValues("#pieceEditor"));
	},

};


