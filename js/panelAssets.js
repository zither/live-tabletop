var blankObject = function(){
  this.outerPanel = 0;
  this.panelBar = 0; this.innerPanel = 0};
var selectedPanel = blankObject;
var selectedBR = blankObject;
var selectedTL = blankObject;
var dragX = 0;
var dragY = 0;
var clickX = 0;
var clickY = 0;
var clickDragGap = 0;
var clickDragGap = 0;
var z = 100;
var invertResize = 1;

function Panel( panelName, xPos, yPos, panelWidth, panelHeight, hasButton) {
  var panel = this;
  panel.outerPanel = new LT.element('div', { 'class' : 'outerPanel', 
    'style' : 'left: ' + xPos + 'px; top: ' + yPos + 'px; visibility: hidden;'
  }, LT.tableTop);
  panel.outerPanel.onmousedown = function(){ panelForward(panel); };
    panelTitle = new LT.element('div', { 'class' : 'title' }, panel.outerPanel);
      var resizeTL = new LT.element('div', { 'class' : 'resizeTL' }, panelTitle);
	  resizeTL.onmousedown = function(){ selectedTL = panel;};
      var titleStart = new LT.element('div', { 'class' : 'titleStart' }, panelTitle);
      var titleCaption = new LT.element('div', { 'class' : 'titleCaption' },
        panelTitle, panelName);
      var titleEnd = new LT.element('div', { 'class' : 'titleEnd' }, panelTitle);
      panel.panelBar = new LT.element('div', { 'class' : 'panelBar', 
        'style' : 'width: ' + (panelWidth - 36) + 'px;' }, panelTitle, ' ');
      panel.panelBar.onmousedown = function(){ selectedPanel = panel; };
      var panelClose = new LT.element('div', { 'class' : 'close' }, panelTitle);
      panelClose.onclick = function(){ showPanel(panel); };
	
    panel.innerPanel = new LT.element('div', { 'class' : 'innerPanel', 
      'style' : 'width: ' + panelWidth + 'px; height: ' + panelHeight + 'px;' 
	}, panel.outerPanel);
    panel.innerPanel.appendChild(document.createTextNode("stuff"));
    var panelBottom = new LT.element('div', { 'class' : 'panelBottom' }, panel.outerPanel);
      var panelBL = new LT.element('div', { 'class' : 'panelBL' }, panelBottom);
      var panelBR = new LT.element('div', { 'class' : 'resizeBR' }, panelBottom);
	  panelBR.onmousedown = function(){ selectedBR = panel;};
// Create Menu Button ------------------------------------------------------
	this.buttonContainer = new LT.element('div', { 'class' : 'buttonUnchecked' }, LT.buttonsDiv);
	panel.buttonContainer.onclick = function(){ showPanel(panel); };
	var buttonStart = new LT.element('div', { 'class' : 'buttonStart' }, panel.buttonContainer);
	var buttonCaption = new LT.element('div', { 'class' : 'buttonCaption' },
      panel.buttonContainer, panelName);
	var buttonEnd = new LT.element('div', { 'class' : 'buttonEnd' }, panel.buttonContainer);
	buttonCaption.onselectstart = function () { return false; };
}

function showPanel(panelShow){
  if(panelShow.outerPanel.style.visibility == "hidden"){
    panelForward(panelShow);
    panelShow.buttonContainer.className = "buttonChecked";
    panelShow.outerPanel.style.visibility = "visible";
  }else{
    panelShow.buttonContainer.className = "buttonUnchecked";
    panelShow.outerPanel.style.visibility = "hidden";
  }
}

document.onmouseup = unSelect;

function unSelect(){
  selectedPanel = blankObject;
  selectedBR = blankObject;
  selectedTL = blankObject;
  clickDragGap = 0;
  return true
}
//DRAGGING -----------------------------------------------------------------------
// Detect if the browser is IE or not.
// If it is not IE, we assume that the browser is NS.
var IE = document.all?true:false;
// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) document.captureEvents(Event.MOUSEMOVE)
// Set-up to use getMouseXY function onMouseMove
document.onmousemove = getMouseXY;

function getMouseXY(e) {
  if (IE) { // grab the x-y pos.s if browser is IE
    dragX = event.clientX + document.body.scrollLeft;
    dragY = event.clientY + document.body.scrollTop;
  } else {  // grab the x-y pos.s if browser is NS
    dragX = e.pageX;
    dragY = e.pageY;
  }
  
  if( selectedPanel != blankObject ){
    movePanel();
  }
  if( selectedBR != blankObject ){
    resizePanel();
  }
  if( selectedTL != blankObject ){
    resizeMove();
  }
}
function movePanel(){
  var panel = selectedPanel.outerPanel;
  var panelW = parseInt(selectedPanel.innerPanel.style.width);
  var panelH = parseInt(selectedPanel.innerPanel.style.height);
  if( clickDragGap == 0 ) {
    clickY = dragY - parseInt(panel.style.top);
    clickX = dragX - parseInt(panel.style.left);
    clickDragGap = 1;
  }
  dragX = dragX - clickX;
  dragY = dragY - clickY;
  if (dragX > window.innerWidth - panelW - 25 ){
  dragX = window.innerWidth - panelW - 25 ;}
  if (dragY > window.innerHeight - panelH - 61){
  dragY = window.innerHeight - panelH - 61;}
  if (dragY < 26){dragY = 26;}
  if (dragX < 6){dragX = 6;}
  panel.style.top  = dragY + "px";
  panel.style.left = dragX + "px";
  // lock to grid
  //locX = (dragX / ' . $configTileWidth . ') + 1;
  //locY = (dragY / ' . $configTileHeight . ');
  return true
}
function resizePanel(){
  var panel = selectedBR.innerPanel;
  var bar = selectedBR.panelBar;
  var panelH = parseInt(panel.style.height);
  var panelWidth = parseInt(panel.style.width);
  var panelX = parseInt(selectedBR.outerPanel.style.left);
  var panelY = parseInt(selectedBR.outerPanel.style.top);
  if( clickDragGap == 0 ) {
    clickY = dragY - parseInt(panel.style.height);
    clickX = dragX - parseInt(panel.style.width);
    clickDragGap = 1;
  }
  dragX = dragX - clickX;
  dragY = dragY - clickY;
  if (dragY < 100){dragY = 100;}
  if (dragX < 100){dragX = 100;}
  if (panelX + dragX + 25 > window.innerWidth ){
    panel.style.width = (window.innerWidth - panelX - 25) + "px";
  } else {
    panel.style.width = dragX + "px";
  }
  if (dragY + panelY + 61 > window.innerHeight){
    panel.style.height = (window.innerHeight - panelY - 61) + "px";
  } else {
    panel.style.height = dragY + "px";
  }
  bar.style.width = (dragX - 36) + "px";
  return true
}
function resizeMove(){
  resizeOP = selectedTL.outerPanel;
  resizeIP = selectedTL.innerPanel;
  bar = selectedTL.panelBar;
  if( clickDragGap == 0 ) {
    clickY = dragY - parseInt(resizeOP.style.top);
    clickX = dragX - parseInt(resizeOP.style.left);
    clickCornerY = dragY + parseInt(resizeIP.style.height);
    clickCornerX = dragX + parseInt(resizeIP.style.width);
    clickDragGap = 1;
  }
  if (dragX < clickX + 6 ){dragX = clickX + 6;}
  if (dragY < clickY + 26){dragY = clickY + 26;}
  if (dragX > clickCornerX - 100){dragX = clickCornerX - 100;}
  if (dragY > clickCornerY - 100){dragY = clickCornerY - 100;}
  resizeOP.style.left = (dragX - clickX) + "px";
  resizeOP.style.top  = (dragY - clickY) + "px";
  resizeIP.style.width = (clickCornerX - dragX) + "px";
  resizeIP.style.height  = (clickCornerY - dragY) + "px";
  bar.style.width = (clickCornerX - dragX - 36) + "px";
  return true
}
function panelForward(panel){
  LT.tableTop.removeChild(panel.outerPanel);
  LT.tableTop.appendChild(panel.outerPanel);
}
