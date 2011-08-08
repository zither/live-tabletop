LT.Palette = function (handler) {
  this.handler = handler;
  this.element = LT.element("div", {'class': 'palette'});
  // shades of gray
  for (var i = 0; i < 5; i++) {
    this._swatch(0, i, i, i, i);
  }
  // shades of primary and secondary colors
  for (var i = 1, x = 2; i < 5; i++) {
    for (var j = i, k = 0; j < 5; j++, k++, x++) {
      this._swatch(x, 0, j, k, k); // red
      this._swatch(x, 1, j, j, k); // yellow
      this._swatch(x, 2, k, j, k); // green
      this._swatch(x, 3, k, j, j); // cyan
      this._swatch(x, 4, k, k, j); // blue
      this._swatch(x, 5, j, k, j); // magenta
    }
  }
  // tints and shades of other colors
  for (var i = 1, x = 18; i < 4; i++, x++) {
    for (var j = i + 1; j < 5; j++) {
      for (var a = j, b = i, c = 0; a < 6; a++, b++, c++, x++) {
        this._swatch(x, 0, a, b, c); // orange
        this._swatch(x, 1, b, a, c); // lime
        this._swatch(x, 2, c, a, b); // teal
        this._swatch(x, 3, c, b, a); // aqua
        this._swatch(x, 4, b, c, a); // purple
        this._swatch(x, 5, a, c, b); // fuschia
      }
    }
  }
};
LT.Palette.prototype = {
  _swatch: function (x, y, r, g, b) {
    var swatch = Game.createElement("div", {'class': 'colorSwatch'});
    swatch.style.left = x * 10 + 'px';
    swatch.style.top = y * 10 + 'px';
    swatch.style.backgroundColor = 'rgb(' + [r  * 51, g * 51, b * 51].join(',') + ')';
    this.element.appendChild(swatch);
    var self = this;
    swatch.onclick = function () {
      if (self.handler) {
        self.handler(r * 51, g * 51, b * 51);
      }
    };
  },
};

