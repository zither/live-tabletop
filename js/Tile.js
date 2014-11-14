// TILE CONSTRUCTOR
LT.Tile = function (data) {
	for (var i = 0; i < LT.Tile.PROPERTIES.length; i++)
		this[LT.Tile.PROPERTIES[i]] = data[LT.Tile.PROPERTIES[i]];
	this.createImage();
	this.createFogElement();
	this.createClickableElement();
};

// GLOBAL VARIABLES
LT.Tile.PROPERTIES = ["fog", "image_id", "x", "y", "table_id"];
LT.Tile.dragging = 0;
LT.Tile.toggleFogValue = 1;
LT.Tile.images = {};

// STATIC FUNCTIONS
LT.Tile.readImages = function () {
	$.post("php/read_images.php", {type: "tile"}, function (data) {
		LT.Tile.images = {};
		for (var i = 0; i < data.length; i++)
			LT.Tile.images[data[i].id] = new LT.Image(data[i]);
		// tile image brushes
		var sortedImages = LT.sortObject(LT.Tile.images, "file");
		for (var i = 0; i < sortedImages.length; i++)
			LT.Tile.createBrush(sortedImages[i]);
	}, "json");
};
LT.Tile.createBrush = function (image) {
	$("<img>").appendTo(".panelContent .toolsTab").attr({
		title: image.file,
		src: "images/upload/tile/" + image.file,
	}).addClass("swatch").click(function () {
		LT.selectedImageID = image.id;
		LT.chooseTool(this, "tile", "#clickTileLayer");
	});
};

LT.dropHandlers.push(function () {
	LT.Tile.dragging = 0;
});

// METHODS OF TILE OBJECTS
LT.Tile.prototype = {

	// CLIENT-SERVER COMMUNICATION
	update: function (mods) {
		var args = LT.applyChanges(this, mods, LT.Tile.PROPERTIES);
		return $.post("php/update_tile.php", args);
	},
	remove: function () {
		return $.post("php/delete_tile.php", {table_id: this.table_id, x: this.x, y: this.y});
	},

	// PROPERTY ACCESSORS (GETTERS) AND MUTATORS (SETTERS)
	getImageID: function () {return this.image_id;},
	setImageID: function (newImageID) {
		if (this.image_id == newImageID) return;
		this.update({image_id: newImageID});
		this.createImage();
	},
	getFog: function () {return this.fog;},
	setFog: function (newFogValue) {
		if (this.fog == newFogValue) return;
		this.update({fog: newFogValue});
		this.createFogElement();
	},
	hasFog: function () {return this.fog == 1;},
	makeFog: function () {this.setFog(1);},
	clearFog: function () {this.setFog(0);},

	// CREATE A PROPERLY SCALED AND POSITIONED IMAGE
	createImage: function () {
		// remove the image
		if (this.image) {
			$(this.image).remove();
			delete this.image;
		}
		// if the tile is not empty, create a new image
		if (this.image_id != -1) {
			var image = LT.Tile.images[this.image_id];
			var table = LT.currentTable;
			// scaling factors = current table scale / original image scale
			var xScale = table.tile_width /	image.tile_width;
			var yScale = table.tile_height / image.tile_height;
			// stretch image dimensions
			var image_width = Math.round(image.width * xScale);
			var image_height = Math.round(image.height * yScale);
			// stretch center coordinates, and invert them as negative margins
			var margin_left = -Math.round(image.center_x * xScale);
			var margin_top = -Math.round(image.center_y * yScale);
			// position relative to center of tile by adding half a tile width
			var left = Math.round((this.x + 0.5) * table.tile_width);
			var top = Math.round((this.y + 0.5) * table.tile_height);
			// stagger isometric or hex tiles
			if (table.tile_mode == "isometric" || table.tile_mode == "hex rows")
				left += Math.round(0.5 * table.tile_width * (this.y % 2));
			else if (table.tile_mode == "hex columns")
				top += Math.round(0.5 * table.tile_height * (this.x % 2));
			// create the new image element
			this.image = $("<img>").attr("src", image.getURL()).css({
				position: "absolute", // TODO: put this in style.css?
				left: left + "px",
				top: top + "px",
				width: image_width + "px",
				height: image_height + "px",
				marginLeft: margin_left + "px",
				marginTop: margin_top + "px",
			})[0];
			// create as many new sub-layers as needed
			for (var i = $("#tileLayer *").length; i < image.layer + 1; i++)
				$("#tileLayer").append($("<div>"));
			// add the new image to the appropriate sub-layer
			// insert tile image in left-to-right, top-to-bottom order
			// find the correct place for this tile using binary search
			var sublayer = $("#tileLayer *")[image.layer];
			var images = $(sublayer).children();
			var start = 0;
			var end = images.length;
			while (start < end) {
				var middle = Math.floor((start + end) / 2);
				var midTop = parseInt($(images[middle]).css("top"));
				var midLeft = parseInt($(images[middle]).css("left"));
				if (midTop > top || (midTop == top && midLeft > left))
					end = middle;
				else
					start = middle + 1;
			}
			if (end == images.length) $(this.image).appendTo(sublayer);
			else if (end == 0) $(this.image).prependTo(sublayer);
			else $(this.image).insertBefore($(images[end]));
		}
	},

	// CREATE AN ELEMENT YOU CAN CLICK ON TO CHANGE THE TILE
	createClickableElement: function () {
		var self = this;
		var left = this.x * LT.currentTable.tile_width;
		var top = this.y * LT.currentTable.tile_height;
		// stagger isometric or hex tiles
		if (LT.currentTable.tile_mode == "isometric"
			|| LT.currentTable.tile_mode == "hex rows")
			left += Math.round(LT.currentTable.tile_width * (this.y % 2) / 2);
		else if (LT.currentTable.tile_mode == "hex columns")
			top += Math.round(LT.currentTable.tile_height * (this.x % 2) / 2);
		// create the new clickable element
		$("<div>").appendTo("#clickTileLayer").css({
			left: left + "px",
			top: top + "px",
			width: LT.currentTable.tile_width + "px",
			height: LT.currentTable.tile_height + "px",
		}).mousedown(function () {
			LT.Tile.dragging = 1;
			if (LT.brush == "tile")
				self.setImageID(LT.selectedImageID);
			else if (LT.brush == "fog") {
				LT.Tile.toggleFogValue = 1 - self.fog;
				self.setFog(LT.Tile.toggleFogValue);
			}
		}).mouseover(function () {
			if (LT.Tile.dragging == 1) {
				if (LT.brush == "tile")
					self.setImageID(LT.selectedImageID);
				else if (LT.brush == "fog")
					self.setFog(LT.Tile.toggleFogValue);
			}
		});
	},

	// CREATE FOG OBSCURING THE TILE
	createFogElement: function () {
		if (this.fogElement) {
			$(this.fogElement).remove();
			delete this.fogElement;
		}
		if (this.fog) {
			var left = (this.x - 0.5) * LT.currentTable.tile_width;
			var top = (this.y - 0.5) * LT.currentTable.tile_height;
			// stagger isometric or hex tiles
			if (LT.currentTable.tile_mode == "isometric"
				|| LT.currentTable.tile_mode == "hex rows")
				left += Math.round(LT.currentTable.tile_width * (this.y % 2) / 2);
			else if (LT.currentTable.tile_mode == "hex columns")
				top += Math.round(LT.currentTable.tile_height * (this.x % 2) / 2);
			// create the new fog element
			this.fogElement = $("<img>").appendTo("#fogLayer").css({
					left: left + "px",
					top: top + "px",
					width: LT.currentTable.tile_width * 2 + "px",
					height: LT.currentTable.tile_height * 2 + "px",
			}).attr("src", "images/fog.png");
		}
	},

};

