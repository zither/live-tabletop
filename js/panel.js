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

// PANEL CONSTRUCTOR

LT.Panel = function (panelName, buttonName, x, y, width, height, buttonLoc) {

  this.tabs = [];

  // Set default parameters
  this.defaultX = x;
  this.defaultY = y;
  this.defaultWidth = width;
  this.defaultHeight = height;
  this.selectedTab = 0;

  LT.Panel.list.push(this); // panels in the order they were created
  LT.Panel.order.push(this); // panels in back-to-front order

  // Remember the current 'this' during event handlers.
  var self = this;

 // Create Floating Panel ----------------------------------------------------

  this.outside = LT.element('div', {'class' : 'outerPanel', 
    'style' : 'left: ' + x + 'px; top: ' + y + 'px; visibility: hidden;'
    }, document.body);
  this.outside.onmousedown = function() {
    self.bringToFront();
  };
  this.outside.style.zIndex = "" + LT.Panel.order.length;

  // Top: includes top-left resize button, title, close button
  var title = LT.element('div', {'class' : 'title'}, this.outside);
  var resizeTL = LT.element('div', {'class' : 'resizeTL'}, title)
  resizeTL.onmousedown = function() {
    LT.Panel.selectedTL = self;
    return false;
  };
  LT.element('div', {'class' : 'titleStart'}, title);
  LT.element('div', {'class' : 'titleCaption'}, title, panelName);
  LT.element('div', {'class' : 'titleEnd'}, title);
  this.bar = LT.element('div', {'class' : 'panelBar', 
    'style' : 'width: ' + (width - 36) + 'px;'}, title, ' ');
  this.bar.onmousedown = function () {
    LT.Panel.selected = self;
    return false;
  };
  var close = LT.element('div', {'class' : 'close'}, title);
  close.onclick = function () {
	self.toggleVisibility();
    return false;
  };
  
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
    .onmousedown = function() {LT.Panel.selectedBR = self; return false;};

  // Create Menu Button ------------------------------------------------------

  var menu = buttonLoc ? buttonLoc : LT.buttons;
  this.button = LT.element('div', {'class' : 'buttonUnchecked'}, menu);
  this.button.onclick = function () {
    self.toggleVisibility();
    return false;
  };
  LT.element('div', {'class' : 'buttonStart'}, this.button);
  this.buttonCaption = LT.element('div', {'class' : 'buttonCaption'}, this.button, buttonName);
  LT.element('div', {'class' : 'buttonEnd'}, this.button);

}

// METHODS OF PANEL OBJECTS

LT.Panel.prototype = {

  // Create a tab
  makeTab: function (name, tabAction) {
    if (!this.tabBar) {
      this.tabBar = LT.element('div', {'class' : 'tabBar'}, this.header);
    }
    // FIXME: magic number (color)
    this.content.style.background = "#e7e8e9";
    var isActive = 'activeTab';
    if (this.tabs.length > 0){
      isActive = 'inactiveTab';
    }
    var tabLabel = LT.element('div', {'class' : isActive}, this.tabBar);
    LT.element('div', {'class' : 'tabStart'}, tabLabel);
    LT.element('div', {'class' : 'tabContent'}, tabLabel, name);
    LT.element('div', {'class' : 'tabEnd'}, tabLabel);
    var tabContent = LT.element('div', {});
    this.tabs.push({label : tabLabel, content : tabContent, action : tabAction});
    if (this.tabs.length == 1){
      this.content.appendChild(tabContent);
    }
    var self = this;
    var tabNumber = this.tabs.length - 1;
    tabLabel.onclick = function () {
      self.selectTab(tabNumber);
      return false;
    }
  },

  // Select a tab
  selectTab: function (tabNumber) {
    if (this.tabs.length > 0) {
      var tab = this.tabs[tabNumber];
      for(var n = 0; n < this.tabs.length; n++){
        this.tabs[n].label.className = 'inactiveTab';
      }
      tab.label.className = 'activeTab';
      LT.fill(this.content, tab.content);
      this.selectedTab = tabNumber;
      if (tab.action) {
        tab.action();
      }
    }  
  },
  
  // Restore default dimensions
  refreshPanel: function() {
    // FIXME: magic numbers 12 and 36
    this.outside.style.left = this.defaultX + 'px';
    this.outside.style.top = this.defaultY + 'px';
    this.footer.style.width = this.defaultWidth + 'px';
    this.header.style.width = (this.defaultWidth + 12) + 'px';
    this.bar.style.width = (this.defaultWidth - 36) + 'px';
    this.content.style.width = this.defaultWidth + 'px';
    this.content.style.height = this.defaultHeight + 'px';
  },

  // Show or hide this panel
  toggleVisibility: function () {
    if (this.outside.style.visibility == "hidden") {
      this.show();
    } else {
      this.hide();
    }
  },

  // Show this panel
  show: function () {
    this.bringToFront();
    this.button.className = "buttonChecked";
    this.outside.style.visibility = "visible";
  },

  // Hide this panel
  hide: function () {
    this.button.className = "buttonUnchecked";
    this.outside.style.visibility = "hidden";
  },

  // Move this panel to the top of the stack
  bringToFront: function () {
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
  },

  // Get this panel's dimensions as a string for saving in a cookie
  getCookieString: function () {
	var x = parseInt(this.outside.style.left);
	var y = parseInt(this.outside.style.top);
	var w = parseInt(this.bar.style.width);
	var h = parseInt(this.content.style.height);
    var v = this.outside.style.visibility == "visible" ? 1 : 0;
	var t = this.selectedTab;
	return x + ' ' + y + ' ' + w + ' ' + h + ' ' + v + ' ' + t + '_';
  },

  // Load this panel's dimensions from a string saved in a cookie
  restoreFromCookieString: function (cookieString) {
    LT.element('div', {'class' : 'clearBoth'}, this.tabBar);
    var panelShape = cookieString.split(' ');
    // FIXME: magic numbers
	if (panelShape[0]) {
      var width = parseInt(panelShape[2]);
      this.outside.style.left = panelShape[0] + 'px';
      this.outside.style.top = panelShape[1] + 'px';
      this.content.style.width = width + 36 + 'px';
      this.bar.style.width = width + 'px';
      this.header.style.width = width + 48 + 'px';
      this.footer.style.width = width + 36 + 'px';
      this.content.style.height = panelShape[3] + 'px';
      this.selectTab(parseInt(panelShape[5]));
      if (parseInt(panelShape[4]) == 1) {
        this.show();
      } else {
        this.hide();
	  }
	}
  },

  // Move panel.
  move: function () {
    var w = parseInt(this.content.style.width);
    var h = parseInt(this.content.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.left);
      LT.clickY = LT.dragY - parseInt(this.outside.style.top);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.min(LT.dragX - LT.clickX, window.innerWidth - w - 25);
    LT.dragY = Math.min(LT.dragY - LT.clickY, window.innerHeight - h - 61);
    LT.dragX = Math.max(LT.dragX, 6);
    LT.dragY = Math.max(LT.dragY, 26);
    this.outside.style.top  = LT.dragY + "px";
    this.outside.style.left = LT.dragX + "px";
  },

  // Resize panel using the bottom-right handle.
  resizeBR: function () {
    var panelX = parseInt(this.outside.style.left);
    var panelY = parseInt(this.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.content.style.width);
      LT.clickY = LT.dragY - parseInt(this.content.style.height);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 50);
	var newWidth = Math.min(LT.dragX, window.innerWidth - panelX - 25);
    this.content.style.width = newWidth + "px";
    this.footer.style.width = newWidth + "px";
    this.header.style.width = newWidth + 12 + "px";
    this.content.style.height = Math.min(LT.dragY, window.innerHeight - panelY - 61) + "px";
    this.bar.style.width = (Math.min(LT.dragX, window.innerWidth - panelX - 25) - 36) + "px";
  },

  // Resize panel using the top-left handle.
  resizeTL: function () {
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.left);
      LT.clickY = LT.dragY - parseInt(this.outside.style.top);
      LT.clickCornerX = LT.dragX + parseInt(this.content.style.width);
      LT.clickCornerY = LT.dragY + parseInt(this.content.style.height);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.max(LT.dragX, LT.clickX + 6);
    LT.dragY = Math.max(LT.dragY, LT.clickY + 26);
    LT.dragX = Math.min(LT.dragX, LT.clickCornerX - 140);
    LT.dragY = Math.min(LT.dragY, LT.clickCornerY - 50);
    this.outside.style.left = (LT.dragX - LT.clickX) + "px";
    this.outside.style.top  = (LT.dragY - LT.clickY) + "px";
	var newWidth = Math.min(LT.clickCornerX - LT.dragX);
    this.content.style.width = newWidth + "px";
    this.footer.style.width = newWidth + "px";
    this.header.style.width = newWidth + 12 + "px";
    this.content.style.height = (LT.clickCornerY - LT.dragY) + "px";
    this.bar.style.width = (LT.clickCornerX - LT.dragX - 36) + "px";
  },

};

// GLOBAL VARIABLES

LT.Panel.order = []; // panels in back-to-front order
LT.Panel.list = []; // panels in the order they were created

LT.Panel.selected = null; // panel being moved, null if no panel is being moved
LT.Panel.selectedBR = null; // panel being resized with the bottom right handle
LT.Panel.selectedTL = null; // panel being resized with the top left handle

LT.clickCornerX = 0; // horizontal position of corner being resized
LT.clickCornerY = 0; // vertical position of corner being resized


// STATIC FUNCTIONS

// Save panel Positions
LT.Panel.saveCookie = function(){
  var cookieString = '';
  for (i = 0; i < LT.Panel.list.length; i++) {
	cookieString += LT.Panel.list[i].getCookieString();
  }
  document.cookie = 'panels=' + cookieString + ';';
}

// Load Panel positions
LT.Panel.loadCookie = function (){
  var cookieArray = LT.getCookie('panels');
  var panelsCookie = cookieArray.split('_');
  for(i = 0; i < LT.Panel.list.length; i++){
    LT.Panel.list[i].restoreFromCookieString(panelsCookie[i]);
  }
}

// If a panel is being moved or resized, update it's dimensions.
LT.Panel.drag = function () {
  if (LT.Panel.selected) {
    LT.Panel.selected.move();
  }
  if (LT.Panel.selectedBR) {
    LT.Panel.selectedBR.resizeBR();
  }
  if (LT.Panel.selectedTL) {
    LT.Panel.selectedTL.resizeTL();
  }
}

// Stop moving or resizing panels.
LT.Panel.stopDragging = function () {
  LT.Panel.selected = null;
  LT.Panel.selectedBR = null;
  LT.Panel.selectedTL = null;
}


