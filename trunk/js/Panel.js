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

  // corner resize handles
  var resizeTL = LT.createElement({'class': 'resizeTL'});
  var resizeTR = LT.createElement({'class': 'resizeTR'})
  var resizeBL = LT.createElement({'class': 'resizeBL'});
  var resizeBR = LT.createElement({'class': 'resizeBR'});
  resizeTL.onmousedown = function() {LT.Panel.selectedTL = self; return false;};
  resizeTR.onmousedown = function() {LT.Panel.selectedTR = self; return false;};
  resizeBL.onmousedown = function() {LT.Panel.selectedBL = self; return false;};
  resizeBR.onmousedown = function() {LT.Panel.selectedBR = self; return false;};

  // title bar for dragging the panel around
  this.bar = LT.createElement({'class': 'panelBar', style: {width: (width - 42) + 'px'}}, [' ']);
  this.bar.onmousedown = function () {
    LT.Panel.selected = self;
    return false;
  };

  // close button
  var close = LT.createElement({'class': 'close'});
  close.onclick = function () {
    self.hide();
    LT.Panel.saveCookie();
    return false;
  };

  this.tabBar = LT.createElement({'class': 'tabBar'})
  this.header = LT.createElement({'class': 'panelHeader'});
  this.content = LT.createElement({'class': 'panelContent', style: {height: height + 'px'}});
  this.footer = LT.createElement({'class': 'panelFooter'});

  // panel structure
  this.outside = LT.createElement(document.body, {'class': 'outerPanel', 
    style: {left: x + 'px', top: y + 'px', visibility: 'hidden', width: width + 'px'}}, [
    [{'class': 'title'}, [
      resizeTL,
      [{'class': 'titleStart'}],
      [{'class': 'titleCaption'}, [panelName]],
      [{'class': 'titleEnd'}],
      this.bar,
      resizeTR,
      close,
    ]],
    this.tabBar,
    this.header,
    this.content,
    this.footer, 
    [{'class': 'panelBottom'}, [
      resizeBL,
      resizeBR,
    ]],
  ]);
  this.outside.onmousedown = function() {self.bringToFront();};
  this.outside.style.zIndex = "" + LT.Panel.order.length;

  // Create Menu Button ------------------------------------------------------

  this.buttonCaption = LT.createElement({'class': 'buttonCaption'}, [buttonName]);
  var menu = buttonLoc ? buttonLoc : LT.buttons;
  this.button = LT.createElement(menu, {'class': 'buttonUnchecked'}, 
    [[{'class': 'buttonStart'}], this.buttonCaption, [{'class': 'buttonEnd'}]]);
  this.button.onclick = function () {
    if (self.outside.style.visibility == "hidden") self.show();
    else self.hide();
    LT.Panel.saveCookie();
    return false;
  };

}


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
  if (cookieArray) {
    var panelsCookie = cookieArray.split('_');
    for(i = 0; i < LT.Panel.list.length; i++){
      LT.Panel.list[i].restoreFromCookieString(panelsCookie[i]);
    }
  }
}

// If a panel is being moved or resized, update it's dimensions.
LT.dragHandlers.push(function () {
  if (LT.Panel.selected) LT.Panel.selected.move();
  if (LT.Panel.selectedBL) LT.Panel.selectedBL.resizeBL();
  if (LT.Panel.selectedBR) LT.Panel.selectedBR.resizeBR();
  if (LT.Panel.selectedTR) LT.Panel.selectedTR.resizeTR();
  if (LT.Panel.selectedTL) LT.Panel.selectedTL.resizeTL();
});

// Stop moving or resizing panels.
LT.dropHandlers.push(function () {
  LT.Panel.selected = null;
  LT.Panel.selectedTR = null;
  LT.Panel.selectedTL = null;
  LT.Panel.selectedBR = null;
  LT.Panel.selectedBL = null;
  LT.Panel.saveCookie();
});


// METHODS OF PANEL OBJECTS

LT.Panel.prototype = {

  // Create a tab
  makeTab: function (name, tabAction) {
    var isActive = 'activeTab';
    if (this.tabs.length > 0) isActive = 'inactiveTab';
    tabLabel = LT.createElement(this.tabBar, {'class' : isActive}, [
      [{'class' : 'tabStart'}],
      [{'class' : 'tabContent'}, [name]],
      [{'class' : 'tabEnd'}],
    ]);
    var tabContent = LT.createElement();
    var tabHeader = LT.createElement();
    this.tabs.push({label: tabLabel, content: tabContent, header: tabHeader, action: tabAction});
    if (this.tabs.length == 1) {
      this.content.appendChild(tabContent);
      this.header.appendChild(tabHeader);
    }
    var self = this;
    var tabNumber = this.tabs.length - 1;
    tabLabel.onclick = function () {
      self.selectTab(tabNumber);
      LT.Panel.saveCookie();
      return false;
    }
    return this.tabs[tabNumber];
  },

  // Select a tab
  selectTab: function (tabNumber) {
    this.selectedTab = tabNumber;
    if (this.tabs.length > 0) {
      var tab = this.tabs[tabNumber];
      for(var n = 0; n < this.tabs.length; n++){
        this.tabs[n].label.className = 'inactiveTab';
      }
      tab.label.className = 'activeTab';
      LT.fill(this.content, tab.content);
      LT.fill(this.header, tab.header);
      this.selectedTab = tabNumber;
      if (tab.action) {
        tab.action();
      }
    }
  },

  // Hide tab
  hideTab: function (tabNumber) {
    this.tabs[tabNumber].label.style.display = 'none';
    this.tabs[tabNumber].header.style.display = 'none';
    this.tabs[tabNumber].content.style.display = 'none';
  },
  
  // Show tab
  showTab: function (tabNumber) {
    this.tabs[tabNumber].label.style.display = 'block';
    this.tabs[tabNumber].header.style.display = 'block';
    this.tabs[tabNumber].content.style.display = 'block';
  },  
  
  // Restore default dimensions
  refreshPanel: function() {
    // FIXME: magic numbers 12 and 36
    this.outside.style.left = this.defaultX + 'px';
    this.outside.style.top = this.defaultY + 'px';
	this.setWidth(this.defaultWidth);
    this.content.style.height = this.defaultHeight + 'px';
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

  // Show this panel's button
  showButton: function () {
    this.button.style.display = "block";
  },
  
  // Hide this panel's button
  hideButton: function () {
    this.button.style.display = "none";
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
	var w = parseInt(this.outside.style.width);
	var h = parseInt(this.content.style.height);
    var v = this.outside.style.visibility == "visible" ? 1 : 0;
	var t = this.selectedTab;
	return x + ' ' + y + ' ' + w + ' ' + h + ' ' + v + ' ' + t + '_';
  },

  // Load this panel's dimensions from a string saved in a cookie
  restoreFromCookieString: function (cookieString) {
    LT.createElement(this.tabBar, {'class' : 'clearBoth'});
    if (cookieString) {
      var panelShape = cookieString.split(' ');
      // FIXME: magic numbers
	  if (panelShape[0]) {
        var width = parseInt(panelShape[2]);
        this.outside.style.left = panelShape[0] + 'px';
        this.outside.style.top = panelShape[1] + 'px';
	    this.setWidth(width);
        this.content.style.height = panelShape[3] + 'px';
        this.selectTab(parseInt(panelShape[5]));
        if (parseInt(panelShape[4]) == 1) {
          this.show();
        } else {
          this.hide();
	    }
      }
	}
  },

  // Move panel.
  move: function () {
    var w = parseInt(this.outside.style.width);
    var h = parseInt(this.content.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.left);
      LT.clickY = LT.dragY - parseInt(this.outside.style.top);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.min(LT.dragX - LT.clickX, window.innerWidth - w - 7);
    LT.dragY = Math.min(LT.dragY - LT.clickY, window.innerHeight - h - 61);
    LT.dragX = Math.max(LT.dragX, 5);
    LT.dragY = Math.max(LT.dragY, 26);
    this.outside.style.top  = LT.dragY + "px";
    this.outside.style.left = LT.dragX + "px";
  },

  // Resize panel using the bottom-right handle.
  resizeBR: function () {
    var panelX = parseInt(this.outside.style.left);
    var panelY = parseInt(this.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.width);
      LT.clickY = LT.dragY - parseInt(this.content.style.height);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 50);
	var newWidth = Math.min(LT.dragX, window.innerWidth - panelX - 6);
    this.content.style.height = Math.min(LT.dragY, window.innerHeight - panelY - 56) + "px";
    this.setWidth(newWidth);
  },

  // Resize panel using the top-left handle.
  resizeTL: function () {
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.left);
      LT.clickY = LT.dragY - parseInt(this.outside.style.top);
      LT.clickCornerX = LT.dragX + parseInt(this.outside.style.width);
      LT.clickCornerY = LT.dragY + parseInt(this.content.style.height);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.max(LT.dragX, LT.clickX + 5);
    LT.dragY = Math.max(LT.dragY, LT.clickY + 26);
    LT.dragX = Math.min(LT.dragX, LT.clickCornerX - 140);
    LT.dragY = Math.min(LT.dragY, LT.clickCornerY - 50);
    this.outside.style.left = (LT.dragX - LT.clickX) + "px";
    this.outside.style.top  = (LT.dragY - LT.clickY) + "px";
	var newWidth = Math.min(LT.clickCornerX - LT.dragX);
    this.content.style.height = (LT.clickCornerY - LT.dragY) + "px";
	this.setWidth(newWidth);
  },
	
  // Resize panel using the top-right handle.
  resizeTR: function () {
    var panelX = parseInt(this.outside.style.left);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX;
      LT.clickY = LT.dragY;
      LT.clickH = parseInt(this.content.style.height);
      LT.clickW = parseInt(this.outside.style.width);
      LT.clickT = parseInt(this.outside.style.top);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragY = Math.max(LT.dragY, LT.clickY - LT.clickT + 26);
    LT.dragY = Math.min(LT.dragY, LT.clickY + LT.clickH - 50);
	var newWidth = LT.clickW + (LT.dragX - LT.clickX);
	newWidth = Math.min( newWidth, window.innerWidth - panelX - 6);
	newWidth = Math.max( newWidth, 140 );
	this.setWidth(newWidth);
    var newHeight = LT.clickH + LT.clickY - LT.dragY;
	var newTop = LT.clickT - LT.clickY + LT.dragY;
    this.outside.style.top = newTop + "px";
    this.content.style.height = newHeight + "px";
  },
  
  // Resize panel using the bottom-left handle.
  resizeBL: function () {
    var panelY = parseInt(this.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(this.outside.style.left);
      LT.clickY = LT.dragY;
      LT.clickH = parseInt(this.content.style.height);
      LT.clickCornerX = LT.dragX + parseInt(this.outside.style.width);
      LT.clickDragGap = 1;
    }
    // FIXME: magic numbers
    LT.dragX = Math.max(LT.dragX, LT.clickX + 5);
    LT.dragX = Math.min(LT.dragX, LT.clickCornerX - 140);
    this.outside.style.left = (LT.dragX - LT.clickX) + "px";
    LT.dragY = Math.max(LT.dragY, panelY + 100);
    LT.dragY = Math.min(LT.dragY, window.innerHeight - 5);
	var newWidth = Math.min(LT.clickCornerX - LT.dragX);
    this.content.style.height = (LT.clickH - LT.clickY + LT.dragY) + "px";
	this.setWidth(newWidth);
  },
	
  setWidth: function (newWidth) {
	  this.outside.style.width = newWidth + "px";
    this.bar.style.width = newWidth - 44 + "px";
  }
};

