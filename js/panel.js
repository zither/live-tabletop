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

LT.Panel = function ( panelName, buttonName, buttonLoc, xPos, yPos, panelWidth, panelHeight) {

  var panel = this; // Remember the current 'this' during event handlers.

  // Create Floating Panel ---------------------------------------------------

  this.outerPanel = LT.element('div', {'class' : 'outerPanel', 
    'style' : 'left: ' + xPos + 'px; top: ' + yPos + 'px; visibility: hidden;'
  }, LT.tableTop);
  this.outerPanel.onmousedown = function() {panel.bringToFront();};

  // Top: includes top-left resize button, title, close button
  var panelTitle = LT.element('div', {'class' : 'title'}, this.outerPanel);
  var resizeTL = LT.element('div', {'class' : 'resizeTL'}, panelTitle);
  resizeTL.onmousedown = function() {LT.selectedTL = panel;};
  LT.element('div', {'class' : 'titleStart'}, panelTitle);
  LT.element('div', {'class' : 'titleCaption'}, panelTitle, panelName);
  LT.element('div', {'class' : 'titleEnd'}, panelTitle);
  this.panelBar = LT.element('div', {'class' : 'panelBar', 
    'style' : 'width: ' + (panelWidth - 36) + 'px;'}, panelTitle, ' ');
  this.panelBar.onmousedown = function() {LT.selectedPanel = panel;};
  var panelClose = LT.element('div', {'class' : 'close'}, panelTitle);
  panelClose.onclick = function() {panel.show();};

  // Middle: panelContent contains elements specific to each panel
  this.innerPanel = LT.element('div', {'class' : 'innerPanel', 
    'style' : 'width: ' + panelWidth + 'px; height: ' + panelHeight + 'px;' 
    }, this.outerPanel);
  this.panelContent = LT.element('div', {}, this.innerPanel, "");

  // Bottom: includes bottom-right resize button
  var panelBottom = LT.element('div', {'class' : 'panelBottom'}, this.outerPanel);
  var panelBL = LT.element('div', {'class' : 'panelBL'}, panelBottom);
  var panelBR = LT.element('div', {'class' : 'resizeBR'}, panelBottom);
  panelBR.onmousedown = function() {LT.selectedBR = panel;};

  // Create Menu Button ------------------------------------------------------

  this.buttonContainer = LT.element('div', {'class' : 'buttonUnchecked'}, buttonLoc);
  this.buttonContainer.onclick = function() {panel.show();};
  LT.element('div', {'class' : 'buttonStart'}, this.buttonContainer);
  var buttonCaption = LT.element('div', {'class' : 'buttonCaption'},
    this.buttonContainer, buttonName);
  buttonCaption.onselectstart = function () {return false;};
  LT.element('div', {'class' : 'buttonEnd'}, this.buttonContainer);
}

LT.Panel.prototype.show = function(){
  if(this.outerPanel.style.visibility == "hidden"){
    this.bringToFront();
    this.buttonContainer.className = "buttonChecked";
    this.outerPanel.style.visibility = "visible";
  } else {
    this.buttonContainer.className = "buttonUnchecked";
    this.outerPanel.style.visibility = "hidden";
  }
}

LT.Panel.prototype.bringToFront = function(){
  // Remember the current value of 'this' until the timeout executes.
  var panel = this;
  setTimeout(function () {
    // We delay this until the event handler is finished to avoid strange
    // behavior that happens when we modify the DOM during mousedown events.
    LT.tableTop.removeChild(panel.outerPanel);
    LT.tableTop.appendChild(panel.outerPanel);
  }, 0);
};

// DRAGGING: Use document event handlers to move and resize windows.

document.onmouseup = function () {
  LT.selectedPanel = null;
  LT.selectedBR = null;
  LT.selectedTL = null;
  LT.clickDragGap = 0;
}

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
    var width = parseInt(LT.selectedPanel.innerPanel.style.width);
    var height = parseInt(LT.selectedPanel.innerPanel.style.height);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedPanel.outerPanel.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedPanel.outerPanel.style.top);
      LT.clickDragGap = 1;
   }
    LT.dragX = Math.min(LT.dragX - LT.clickX, window.innerWidth - width - 25);
    LT.dragY = Math.min(LT.dragY - LT.clickY, window.innerHeight - height - 61);
    LT.dragX = Math.max(LT.dragX, 26);
    LT.dragY = Math.max(LT.dragY, 6);
    LT.selectedPanel.outerPanel.style.top  = LT.dragY + "px";
    LT.selectedPanel.outerPanel.style.left = LT.dragX + "px";
  }

  // Resize panel using the bottom-right handle.
  if (LT.selectedBR) {
    var panelX = parseInt(LT.selectedBR.outerPanel.style.left);
    var panelY = parseInt(LT.selectedBR.outerPanel.style.top);
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedBR.innerPanel.style.width);
      LT.clickY = LT.dragY - parseInt(LT.selectedBR.innerPanel.style.height);
      LT.clickDragGap = 1;
   }
/*
    LT.dragX = Math.min(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.min(LT.dragY - LT.clickY, 100);
    LT.selectedBR.innerPanel.style.width = Math.max(LT.dragX,
      window.innerWidth - panelX - 25) + "px";
    LT.selectedBR.innerPanel.style.height = Math.max(LT.dragY,
      window.innerHeight - panelY - 61) + "px";
*/
    LT.dragX = Math.max(LT.dragX - LT.clickX, 140);
    LT.dragY = Math.max(LT.dragY - LT.clickY, 100);
    LT.selectedBR.innerPanel.style.width = Math.min(LT.dragX,
      window.innerWidth - panelX - 25) + "px";
    LT.selectedBR.innerPanel.style.height = Math.min(LT.dragY,
      window.innerHeight - panelY - 61) + "px";
    LT.selectedBR.panelBar.style.width = (LT.dragX - 36) + "px";
  }

  // Resize panel using the top-left handle.
  if (LT.selectedTL) {
    if (LT.clickDragGap == 0) {
      LT.clickX = LT.dragX - parseInt(LT.selectedTL.outerPanel.style.left);
      LT.clickY = LT.dragY - parseInt(LT.selectedTL.outerPanel.style.top);
      LT.clickCornerX = LT.dragX + parseInt(LT.selectedTL.innerPanel.style.width);
      LT.clickCornerY = LT.dragY + parseInt(LT.selectedTL.innerPanel.style.height);
      LT.clickDragGap = 1;
    }
    LT.dragX = Math.min(Math.max(LT.dragX, LT.clickX + 6), LT.clickCornerX - 140);
    LT.dragY = Math.min(Math.max(LT.dragY, LT.clickY + 26), LT.clickCornerY - 100);
    LT.selectedTL.outerPanel.style.left = (LT.dragX - LT.clickX) + "px";
    LT.selectedTL.outerPanel.style.top  = (LT.dragY - LT.clickY) + "px";
    LT.selectedTL.innerPanel.style.width  = (LT.clickCornerX - LT.dragX) + "px";
    LT.selectedTL.innerPanel.style.height = (LT.clickCornerY - LT.dragY) + "px";
    LT.selectedTL.panelBar.style.width = (LT.clickCornerX - LT.dragX - 36) + "px";
  }
};

