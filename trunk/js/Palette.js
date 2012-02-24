LT.Palette = function (theHandler, theParent, theBrightness) {
  this.brightness = theBrightness || 6;
  this.handler = theHandler;
  this.selected = null;
  this.element = LT.createElement(theParent, {style: {
    clear: 'left',
    height: theBrightness * this.SWATCH_HEIGHT + 'px',
    position: 'relative',
    border: '2px solid transparent',
  }});
  for (var r = 0; r < theBrightness; r++) {
    for (var g = 0; g < theBrightness; g++) {
      for (var b = 0; b < theBrightness; b++) {
        this._swatch(r * theBrightness + g, b, r, g, b);
      }
    }
  }
/*
  // shades of gray
  for (var i = 0; i < 5; i++) {
    this._swatch(0, i, i, i, i);
  }
  // shades of primary and secondary colors
  for (var i = 1, x = 2; i < this.brightness; i++) {
    for (var j = i, k = 0; j < this.brightness; j++, k++, x++) {
      this._swatch(x, 0, j, j, k); // yellow
      this._swatch(x, 1, k, j, k); // green
      this._swatch(x, 2, k, j, j); // cyan
      this._swatch(x, 3, k, k, j); // blue
      this._swatch(x, 4, j, k, j); // magenta
      this._swatch(x, 5, j, k, k); // red
    }
  }
  // tints and shades of other colors
  var x = 3 + this.brightness * (this.brightness - 1) / 2;
  for (var i = 1; i < this.brightness - 1; i++, x++) {
    for (var j = i + 1; j < this.brightness; j++) {
      for (var a = j, b = i, c = 0; a < 6; a++, b++, c++, x++) {
        this._swatch(x, 0, b, a, c); // lime
        this._swatch(x, 1, c, a, b); // teal
        this._swatch(x, 2, c, b, a); // aqua
        this._swatch(x, 3, b, c, a); // purple
        this._swatch(x, 4, a, c, b); // fuschia
        this._swatch(x, 5, a, b, c); // orange
      }
    }
  }
*/
};

LT.Palette.prototype = {
  SWATCH_WIDTH: 5,
  SWATCH_HEIGHT: 5,
  _swatch: function (x, y, r, g, b) {
    var red = r * 51;
    var green = g * 51;
    var blue = b * 51;
    var swatch = LT.createElement(this.element, {style: {
      position: 'absolute',
      left: x * this.SWATCH_WIDTH + 'px',
      top: y * this.SWATCH_HEIGHT + 'px',
      width: this.SWATCH_WIDTH + 'px',
      height: this.SWATCH_HEIGHT + 'px',
      'background-color': 'rgb(' + [red, green, blue].join(',') + ')',
    }});
    var self = this;
    swatch.onclick = function () {
      if (self.selected) {
        self.selected.style.border = '0';
        self.selected.style.margin = '0';
        self.selected.style.zIndex = 0;
      }
      swatch.style.border = '1px solid black';
      swatch.style.margin = '-1px';
      swatch.style.zIndex = 1;
      self.selected = swatch;
      if (self.handler) self.handler(red, green, blue);
    };
  },
  getColor: function () {
    if (this.selected) return this.selected.style.backgroundColor;
    else return "";
  },
};

