LT.Palette = function (theHandler, theParent, theBrightness) {
	this.brightness = theBrightness || 6;
	this.handler = theHandler;
	this.selected = null;
	this.element = $("<div>").appendTo(theParent).addClass("colorPalette")
		.css({height: theBrightness * this.SWATCH_HEIGHT + "px"});
	for (var r = 0; r < theBrightness; r++)
		for (var g = 0; g < theBrightness; g++)
			for (var b = 0; b < theBrightness; b++)
				this._swatch(r * theBrightness + g, b, r, g, b);
};

LT.Palette.prototype = {
	SWATCH_WIDTH: 5,
	SWATCH_HEIGHT: 5,
	_swatch: function (x, y, r, g, b) {
		var red = r * 51;
		var green = g * 51;
		var blue = b * 51;
		var self = this;
		var swatch = $("<div>").appendTo(this.element).css({
			left: x * this.SWATCH_WIDTH + "px",
			top: y * this.SWATCH_HEIGHT + "px",
			width: this.SWATCH_WIDTH + "px",
			height: this.SWATCH_HEIGHT + "px",
			backgroundColor: "rgb(" + [red, green, blue].join(",") + ")",
		}).click(function () {
			$(this).addClass("selected");
			if (self.selected) $(self.selected).removeClass("selected");
			self.selected = this;
			if (self.handler) self.handler(red, green, blue);
		}).addClass("colorSwatch")[0];
	},
	getColor: function () {
		if (this.selected) return this.selected.style.backgroundColor;
		else return "";
	},
};

