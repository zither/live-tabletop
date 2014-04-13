// IMAGE CONSTRUCTOR
LT.Image = function (data) {
	for (var i = 0; i < LT.Image.PROPERTIES.length; i++)
		this[LT.Image.PROPERTIES[i]] = data[LT.Image.PROPERTIES[i]];
};

// GLOBAL VARIABLES
LT.Image.PROPERTIES = ["id", "file", "type", "user_id", "public",
	"width", "height", "tile_width", "tile_height", "center_x", "center_y",
	"tile_mode", "layer"];

LT.Image.STRINGS = ["file", "type", "tile_mode"];

// METHODS OF IMAGE OBJECTS
LT.Image.prototype = {

	// GET THE LOCATION OF THE IMAGE FILE
	getURL: function () {
		return "images/upload/" + this.type + "/" + this.file;
	},

	// CLIENT-SERVER COMMUNICATION
	update: function (mods) {
		var args = LT.applyChanges(this, mods, LT.Image.PROPERTIES, LT.Image.STRINGS);
		return $.post("php/update_image.php", args);
	},
	remove: function () {
		return $.post("php/delete_image.php", {image_id: this.id});
	},

};


