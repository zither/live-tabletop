// GLOBAL VARIABLES

LT.selectedPanel = null;
LT.selectedBR = null;
LT.selectedTL = null;
LT.dragX = 0; // current horizontal mouse position
LT.dragY = 0; // current vertical mouse position
LT.clickX = 0; // relative horizontal position of mouse when the button was pressed
LT.clickY = 0; // relative vertical position of mouse when the button was pressed
LT.clickCornerX = 0;
LT.clickCornerY = 0;
LT.clickDragGap = 0;

// PANEL CLASS CONSTRUCTOR

LT.Panel = function (panelName, buttonName, buttonLoc, x, y, width, height) {

  var panel = this; // Remember the current 'this' during event handlers.

  // Create Floating Panel ---------------------------------------------------

  this.outside = LT.element('div', {'class' : 'outerPanel', 
    'style' : 'left: ' + x + 'px; top: ' + y + 'px; visibility: hidden;'
    }, LT.tableTop);
  this.outside.onmousedown = function() {panel.bringToFront();};

  // Top: includes top-left resize button, title, close button
  var title = LT.element('div', {'class' : 'title'}, this.outside);
  LT.element('div', {'class' : 'resizeTL'}, title)
    .onmousedown = function() {LT.selectedTL = panel;};
  LT.element('div', {'class' : 'titleStart'}, title);
  LT.element('div', {'class' : 'titleCaption'}, title, panelName);
  LT.element('div', {'class' : 'titleEnd'}, title);
  this.bar = LT.element('div', {'class' : 'panelBar', 
    'style' : 'width: ' + (width - 36) + 'px;'}, title, ' ');
  this.bar.onmousedown = function() {LT.selectedPanel = panel;};
  LT.element('div', {'class' : 'close'}, title)
    .onclick = function() {panel.show();};

  // Middle: this.content contains elements specific to each panel
  this.inside = LT.element('div', {'class' : 'innerPanel', 
    'style' : 'width: ' + width + 'px; height: ' + height + 'px;' 
    }, this.outside);
  this.content = LT.element('div', {}, this.inside, "");

  // Bottom: includes bottom-right resize button
  var bottom = LT.element('div', {'class' : 'panelBottom'}, this.outside);
  LT.element('div', {'class' : 'panelBL'}, bottom);
  LT.element('div', {'class' : 'resizeBR'}, bottom)
    .onmousedown = function() {LT.selectedBR = panel;};

  // Create Menu Button ------------------------------------------------------

  this.button = LT.element('div', {'class' : 'buttonUnchecked'}, buttonLoc);
  this.button.onclick = function() {panel.show();};
  LT.element('div', {'class' : 'buttonStart'}, this.button);
  LT.element('div', {'class' : 'buttonCaption'}, this.button, buttonName);
  LT.element('div', {'class' : 'buttonEnd'}, this.button);
}

LT.Panel.prototype.show = function() {
  if(this.outside.style.visibility == "hidden") {
    this.bringToFront();
    this.button.className = "buttonChecked";
    this.outside.style.visibility = "visible";
  } else {
    this.button.className = "buttonUnchecked";
    this.outside.style.visibility = "hidden";
  }
}

LT.Panel.prototype.bringToFront = function() {
  // Remember the current value of 'this' until the timeout executes.
  var panel = this;
  setTimeout(function () {
    // We delay this until the event handler is finished to avoid strange
    // behavior that happens when we modify the DOM during mousedown events.
    LT.tableTop.removeChild(panel.outside);
    LT.tableTop.appendChild(panel.outside);
  }, 0);
};

// DRAGGING: Use document event handlers to move and resize windows.

// Prevent text selection while dragging in IE and Chrome.
document.onselectstart = function () {return false;}

// Prevent text selection while dragging in Firefox.
document.onmousedown = function () {return false;}

// Stop dragging when the mouse button is released.
document.onmouseup = function () {
  LT.selectedPanel = null;
  LT.selectedBR = null;
  LT.selectedTL = null;
  LT.clickDragGap = 0;
}

// Move or resize a panel when the mouse is dragged.
document.onmousemove = function (e) {
  if (!e) var e = window.event;

  // grab the X and Y position of the mouse cursor
  if (document.all) { // IE browser
    LT.dragX = e.clientX + document.body.scrollLeft;
    LT.dragY = e.clientY + document.body.scrollTop;
  } else { // NS browser
    LT.dragX = e.pageX;
    LT.dragY = e.pageY;
  }
  
  // Move panel.
  if (LT.selectedPanel) {
    var w = parseInt(LT.selectedPanel.inside.style.width);
    var h = parseInt(LT.selectedPanel.inside.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedPanel.outside.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedPanel.outside.style.top);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.min(LT.dragX - LT.clickX, window.innerWidth - w - 25);
    LT.dragY = Math.min(LT.dragY - LT.clickY, window.innerHeight - h - 61);
    LT.dragX = Math.max(LT.dragX, 26);
    LT.dragY = Math.max(LT.dragY, 6);
    LT.selectedPanel.outside.style.top  = LT.dragY + "px";
    LT.selectedPanel.outside.style.left = LT.dragX + "px";
  }

  // Resize panel using the bottom-right handle.
  if (LT.selectedBR) {
    var panelX = parseInt(LT.selectedBR.outside.style.left);
    var panelY = parseInt(LT.selectedBR.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedBR.inside.style.width);
      LT.clickY = LT.dragY - parseInt(LT.selectedBR.inside.style.height);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 100);
    LT.selectedBR.inside.style.width = Math.min(LT.dragX,
      window.innerWidth - panelX - 25) + "px";
    LT.selectedBR.inside.style.height = Math.min(LT.dragY,
      window.innerHeight - panelY - 61) + "px";
    LT.selectedBR.bar.style.width = (LT.dragX - 36) + "px";
  }

  // Resize panel using the top-left handle.
  if (LT.selectedTL) {
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedTL.outside.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedTL.outside.style.top);
      LT.clickCornerX = LT.dragX + parseInt(LT.selectedTL.inside.style.width);
      LT.clickCornerY = LT.dragY + parseInt(LT.selectedTL.inside.style.height);
      LT.clickDragGap = 1;
    }
    LT.dragX = Math.max(LT.dragX, LT.clickX + 6);
    LT.dragY = Math.max(LT.dragY, LT.clickY + 26);
    LT.dragX = Math.min(LT.dragX, LT.clickCornerX - 140);
    LT.dragY = Math.min(LT.dragY, LT.clickCornerY - 100);
    LT.selectedTL.outside.style.left = (LT.dragX - LT.clickX) + "px";
    LT.selectedTL.outside.style.top  = (LT.dragY - LT.clickY) + "px";
    LT.selectedTL.inside.style.width  = (LT.clickCornerX - LT.dragX) + "px";
    LT.selectedTL.inside.style.height = (LT.clickCornerY - LT.dragY) + "px";
    LT.selectedTL.bar.style.width = (LT.clickCornerX - LT.dragX - 36) + "px";
  }
  e.preventDefault();
  return false;
};

