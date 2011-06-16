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
LT.panelsArray = [];

// PANEL CLASS CONSTRUCTOR

LT.Panel = function (panelName, buttonName, x, y, width, height, buttonLoc) {

  var panel = this; // Remember the current 'this' during event handlers.
  LT.Panel.order.push(this);
  this.tabs = [];
  // Set Default Paramaters
  this.defaultX = x;
  this.defaultY = y;
  this.defaultWidth = width;
  this.defaultHeight = height;
  this.selectedTab = 0;
 // Create Floating Panel 

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
  this.bar.onmousedown = function () {LT.selectedPanel = panel; return false;};
  LT.element('div', {'class' : 'close'}, title)
    .onclick = function () {
	panel.toggleVisibility();
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
    .onmousedown = function() {LT.selectedBR = panel; return false;};

  // Create Menu Button ------------------------------------------------------

  var menu = buttonLoc ? buttonLoc : LT.buttons;
  this.button = LT.element('div', {'class' : 'buttonUnchecked'}, menu);
  this.button.onclick = function () {
    panel.toggleVisibility();
    return false;
  };
  LT.element('div', {'class' : 'buttonStart'}, this.button);
  this.buttonCaption = LT.element('div', {'class' : 'buttonCaption'}, this.button, buttonName);
  LT.element('div', {'class' : 'buttonEnd'}, this.button);
  LT.panelsArray.push(this);
}

LT.Panel.order = [];

//PANEL TABS FUNCTION
LT.Panel.prototype.makeTab = function (name, action) {
  if(!this.tabBar){
    this.tabBar = LT.element('div', {'class' : 'tabBar'}, this.header);
  }
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
  this.tabs.push({'label' : tabLabel, 'content' : tabContent, 'action' : action});
  if (this.tabs.length == 1){
    this.content.appendChild(tabContent);
  }
  var self = this;
  var tabNumber = this.tabs.length - 1;
  tabLabel.onclick = function () {
    self.selectTab(tabNumber);
    return false;
  }
}
LT.Panel.prototype.selectTab = function (tabNumber) {
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

LT.Panel.prototype.refreshPanel = function(){
  this.outside.style.left = this.defaultX + 'px';
  this.outside.style.top = this.defaultY + 'px';
  this.footer.style.width = this.defaultWidth + 'px';
  this.header.style.width = (this.defaultWidth + 12) + 'px';
  this.bar.style.width = (this.defaultWidth -36) + 'px';
  this.content.style.width = this.defaultWidth + 'px';
  this.content.style.height = this.defaultHeight + 'px';
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

// Save panel Positions
LT.savePanels = function(){
  var cookieString = '';
  for(i = 0; i < LT.panelsArray.length; i++){
	var x = parseInt(LT.panelsArray[i].outside.style.left);
	var y = parseInt(LT.panelsArray[i].outside.style.top);
	var w = parseInt(LT.panelsArray[i].bar.style.width);
	var h = parseInt(LT.panelsArray[i].content.style.height);
	var v = 0;
	var t = LT.panelsArray[i].selectedTab;
	if ( LT.panelsArray[i].outside.style.visibility == "visible" ){ v = 1;
	}else{ v = 0; }
	cookieString = cookieString + x + ' ' + y + ' ' + w + ' ' + h + ' ' + v + ' ' + t + '_';
  }
  document.cookie = 'panels=' + cookieString + ';';
}

// Load Panel positions
LT.loadPanels = function (){
  var cookieArray = getCookie('panels');
  var panelsCookie = cookieArray.split('_');
  for(i = 0; i < LT.panelsArray.length; i++){
    LT.element('div', {'class' : 'clearBoth'}, LT.panelsArray[i].tabBar);
    var panelShape = panelsCookie[i].split(' ');
	if( panelShape[0] ){
      LT.panelsArray[i].outside.style.left = panelShape[0] + 'px';
      LT.panelsArray[i].outside.style.top = panelShape[1] + 'px';
      LT.panelsArray[i].content.style.width = parseInt(panelShape[2]) + 36 + 'px';
      LT.panelsArray[i].bar.style.width = parseInt(panelShape[2]) + 'px';
      LT.panelsArray[i].header.style.width = parseInt(panelShape[2]) + 48 + 'px';
      LT.panelsArray[i].footer.style.width = parseInt(panelShape[2]) + 36 + 'px';
      LT.panelsArray[i].content.style.height = panelShape[3] + 'px';
	  if (panelShape[5]) {
        LT.panelsArray[i].selectedTab = parseInt(panelShape[5]);
	  } else {
        LT.panelsArray[i].selectedTab = 0;
	  }
	  if (LT.panelsArray[i].tabBar) {
	    LT.panelsArray[i].selectTab(LT.panelsArray[i].selectedTab);
	  }
      if(Boolean(panelShape[4] == 1)){
        if(LT.panelsArray[i].outside.style.visibility = "hidden"){
		  LT.panelsArray[i].toggleVisibility();
		}
      }else{
	    if(LT.panelsArray[i].outside.style.visibility = "visible"){
		  LT.panelsArray[i].toggleVisibility();
		}
	  }
	}
  }
}

// Move panel.
LT.movePanel = function () {
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
LT.resizePanelBR = function () {
    var panelX = parseInt(LT.selectedBR.outside.style.left);
    var panelY = parseInt(LT.selectedBR.outside.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedBR.content.style.width);
      LT.clickY = LT.dragY - parseInt(LT.selectedBR.content.style.height);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 50);
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
LT.resizePanelTL = function () {
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
    LT.dragY = Math.min(LT.dragY, LT.clickCornerY - 50);
    LT.selectedTL.outside.style.left = (LT.dragX - LT.clickX) + "px";
    LT.selectedTL.outside.style.top  = (LT.dragY - LT.clickY) + "px";
	var newWidth = Math.min(LT.clickCornerX - LT.dragX);
    LT.selectedTL.content.style.width = newWidth + "px";
    LT.selectedTL.footer.style.width = newWidth + "px";
    LT.selectedTL.header.style.width = newWidth + 12 + "px";
    LT.selectedTL.content.style.height = (LT.clickCornerY - LT.dragY) + "px";
    LT.selectedTL.bar.style.width = (LT.clickCornerX - LT.dragX - 36) + "px";
}

function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
{
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}