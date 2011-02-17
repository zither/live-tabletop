/*
The LT.Panel constructor takes six arguments:
  panelName is the name that will be displayed in the panel's title bar.
  buttonName will be displayed next to the button that toggleVisibilitys the panel.
  x is the panel's initial horizontal position.
  y is the panel's initial vertical position.
  width is the panel's initial width.
  height is the panel's initial height.

Once created the panels will take care of themselves.

Each panel has a content property which is an element to which you may append
other elements to populate the panel with forms, tables, text, etc.
*/

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

LT.Panel = function (panelName, buttonName, x, y, width, height, buttonLoc) {

  var panel = this; // Remember the current 'this' during event handlers.
  LT.Panel.order.push(this);

  // Create Floating Panel ---------------------------------------------------

  this.outside = LT.element('div', {'class' : 'outerPanel', 
    'style' : 'left: ' + x + 'px; top: ' + y + 'px; visibility: hidden;'
    }, document.body);
  this.outside.onmousedown = function() {panel.bringToFront();};
  this.outside.style.zIndex = "" + LT.Panel.order.length;

  // Top: includes top-left resize button, title, close button
  var title = LT.element('div', {'class' : 'title'}, this.outside);
  LT.element('div', {'class' : 'resizeTL'}, title)
    .onmousedown = function() {LT.selectedTL = panel; return false;};
  LT.element('div', {'class' : 'titleStart'}, title);
  LT.element('div', {'class' : 'titleCaption'}, title, panelName);
  LT.element('div', {'class' : 'titleEnd'}, title);
  this.bar = LT.element('div', {'class' : 'panelBar', 
    'style' : 'width: ' + (width - 36) + 'px;'}, title, ' ');
  this.bar.onmousedown = function() {LT.selectedPanel = panel; return false;};
  LT.element('div', {'class' : 'close'}, title)
    .onclick = function() {panel.toggleVisibility();};
  
  this.header = LT.element('div', {'class' : 'panelHeader'}, this.outside);
  
  // Middle: this.content contains elements specific to each panel
  this.content = LT.element('div', {'class' : 'panelContent', 
    'style' : 'width: ' + width + 'px; height: ' + height + 'px;' 
    }, this.outside);

  this.footer = LT.element('div', {'class' : 'panelFooter'}, this.outside);
  
  // Bottom: includes bottom-right resize button
  var bottom = LT.element('div', {'class' : 'panelBottom'}, this.outside);
  LT.element('div', {'class' : 'panelBL'}, bottom);
  LT.element('div', {'class' : 'resizeBR'}, bottom)
    .onmousedown = function() {LT.selectedBR = panel; return false;};

  // Create Menu Button ------------------------------------------------------

  var menu = buttonLoc ? buttonLoc : LT.buttons;
  this.button = LT.element('div', {'class' : 'buttonUnchecked'}, menu);
  this.button.onclick = function() {panel.toggleVisibility();};
  LT.element('div', {'class' : 'buttonStart'}, this.button);
  this.buttonCaption = LT.element('div', {'class' : 'buttonCaption'}, this.button, buttonName);
  LT.element('div', {'class' : 'buttonEnd'}, this.button);
}

LT.Panel.order = [];

//PANEL TABS CONSTRUCTOR

LT.Tabs = function (parentPanel, tabNames) {
  this.tabBar = LT.element('div', {'class' : 'tabBar'}, parentPanel.header);
  parentPanel.content.style.background = "#e7e8e9";
  var tick = 1;
  var isActive = 'activeTab';
  for(var name in tabNames){
    tab = LT.element('div', {'class' : isActive}, this.tabBar);
	LT.element('div', {'class' : 'tabStart'}, tab);
	LT.element('div', {'class' : 'tabContent'}, tab, tabNames[name]);
	LT.element('div', {'class' : 'tabEnd'}, tab);
	if(tick){ tick = 0; isActive = "inactiveTab"; }
  }
}

LT.Panel.prototype.toggleVisibility = function() {
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
  var newOrder = [];
  for (var i = 0; i < LT.Panel.order.length; i++) {
    var panel = LT.Panel.order[i];
    if (panel != this) {
      newOrder.push(panel);
      panel.outside.style.zIndex = "" + newOrder.length;
    }
  }
  newOrder.push(this);
  this.outside.style.zIndex = "" + newOrder.length;
  LT.Panel.order = newOrder;
};

// DRAGGING: Use document event handlers to move and resize windows.

// Prevent text selection while dragging in IE and Chrome.
document.onselectstart = function () {return false;}

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
    var w = parseInt(LT.selectedPanel.content.style.width);
    var h = parseInt(LT.selectedPanel.content.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedPanel.outside.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedPanel.outside.style.top);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.min(LT.dragX - LT.clickX, window.innerWidth - w - 25);
    LT.dragY = Math.min(LT.dragY - LT.clickY, window.innerHeight - h - 61);
    LT.dragX = Math.max(LT.dragX, 6);
    LT.dragY = Math.max(LT.dragY, 26);
    LT.selectedPanel.outside.style.top  = LT.dragY + "px";
    LT.selectedPanel.outside.style.left = LT.dragX + "px";
  }

  // Resize panel using the bottom-right handle.
  if (LT.selectedBR) {
    var panelX = parseInt(LT.selectedBR.outside.style.left);
    var panelY = parseInt(LT.selectedBR.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedBR.content.style.width);
      LT.clickY = LT.dragY - parseInt(LT.selectedBR.content.style.height);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 100);
	var newWidth = Math.min(LT.dragX, window.innerWidth - panelX - 25);
    LT.selectedBR.content.style.width = newWidth + "px";
    LT.selectedBR.footer.style.width = newWidth + "px";
    LT.selectedBR.header.style.width = newWidth + 12 + "px";
    LT.selectedBR.content.style.height = Math.min(LT.dragY,
      window.innerHeight - panelY - 61) + "px";
    LT.selectedBR.bar.style.width = (Math.min(LT.dragX,
      window.innerWidth - panelX - 25) - 36) + "px";
  }

  // Resize panel using the top-left handle.
  if (LT.selectedTL) {
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedTL.outside.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedTL.outside.style.top);
      LT.clickCornerX = LT.dragX + parseInt(LT.selectedTL.content.style.width);
      LT.clickCornerY = LT.dragY + parseInt(LT.selectedTL.content.style.height);
      LT.clickDragGap = 1;
    }
    LT.dragX = Math.max(LT.dragX, LT.clickX + 6);
    LT.dragY = Math.max(LT.dragY, LT.clickY + 26);
    LT.dragX = Math.min(LT.dragX, LT.clickCornerX - 140);
    LT.dragY = Math.min(LT.dragY, LT.clickCornerY - 100);
    LT.selectedTL.outside.style.left = (LT.dragX - LT.clickX) + "px";
    LT.selectedTL.outside.style.top  = (LT.dragY - LT.clickY) + "px";
	var newWidth = Math.min(LT.clickCornerX - LT.dragX);
    LT.selectedTL.content.style.width = newWidth + "px";
    LT.selectedTL.footer.style.width = newWidth + "px";
    LT.selectedTL.header.style.width = newWidth + 12 + "px";
    LT.selectedTL.content.style.height = (LT.clickCornerY - LT.dragY) + "px";
    LT.selectedTL.bar.style.width = (LT.clickCornerX - LT.dragX - 36) + "px";
  }
  e.preventDefault();
  return false;
};