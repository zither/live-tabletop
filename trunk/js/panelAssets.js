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

function createPanel( panelName, xPos, yPos, panelWidth, panelHeight) {
  var panel = this;
  panel.outerPanel = document.createElement('div');
  panel.outerPanel.setAttribute('class', 'outerPanel');
  panel.outerPanel.setAttribute('style', 'left: ' + xPos + 'px; top: ' + yPos + 
  'px; visibility: hidden;');
  panel.outerPanel.onmousedown = function(){ panelForward(panel); };
  document.body.appendChild(panel.outerPanel);
    var panelTitle = document.createElement('div');
    panelTitle.setAttribute('class', 'title');	
      var resizeTL = document.createElement('div');
      resizeTL.setAttribute('class', 'resizeTL');
	  resizeTL.onmousedown = function(){ selectedTL = panel;};
      var titleStart = document.createElement('div');
      titleStart.setAttribute('class', 'titleStart');
      var titleCaption = document.createElement('div');
      titleCaption.setAttribute('class', 'titleCaption');
      var titleEnd = document.createElement('div');
      titleEnd.setAttribute('class', 'titleEnd');
      panel.panelBar = document.createElement('div');
      panel.panelBar.setAttribute('class', 'panelBar');
      panel.panelBar.setAttribute('style', 'width: ' + (panelWidth - 36) + 'px;');
      panel.panelBar.onmousedown = function(){ selectedPanel = panel; };
      var panelClose = document.createElement('div');
      panelClose.setAttribute('class', 'close');
      panelClose.onmouseover = function(){ this.style.backgroundImage = 'url(images/closeHover.png)'; };
      panelClose.onmouseout = function(){ this.style.backgroundImage = 'url(images/close.png)'; };
      panelClose.onclick = function(){ showPanel(panel); };
	  panel.outerPanel.appendChild(panelTitle);
      panelTitle.appendChild(resizeTL);
      panelTitle.appendChild(titleStart);
      panelTitle.appendChild(titleCaption);
      titleCaption.appendChild(document.createTextNode(panelName));
      panelTitle.appendChild(titleEnd);
      panelTitle.appendChild(panel.panelBar);
      panel.panelBar.appendChild(document.createTextNode(" "));
      panelTitle.appendChild(panelClose);
	
    panel.innerPanel = document.createElement('div');
    panel.innerPanel.setAttribute('class', 'innerPanel');
    panel.innerPanel.setAttribute('style', 'width: ' + panelWidth + 'px; height: ' + 
      panelHeight + 'px;');
    var panelBottom = document.createElement('div')
    panelBottom.setAttribute('class', 'panelBottom');
    panel.outerPanel.appendChild(panel.innerPanel);
    panel.innerPanel.appendChild(document.createTextNode("stuff"));
    panel.outerPanel.appendChild(panelBottom);
      var panelBL = document.createElement('div')
      panelBL.setAttribute('class', 'panelBL');
      var panelBR = document.createElement('div')
      panelBR.setAttribute('class', 'resizeBR');
	  panelBR.onmousedown = function(){ selectedBR = panel;};
      panelBottom.appendChild(panelBL);
	  panelBottom.appendChild(panelBR);
// Create Menu Button ------------------------------------------------------
    this.buttonContainer = document.createElement('div');
    panel.buttonContainer.setAttribute('class', 'buttonUnchecked');
	panel.buttonContainer.onclick = function(){ showPanel(panel); };
    document.getElementById('buttons').appendChild(panel.buttonContainer);
	var buttonStart = document.createElement('div')
    buttonStart.setAttribute('class', 'buttonStart');
	var buttonCaption = document.createElement('div')
    buttonCaption.setAttribute('class', 'buttonCaption');
	var buttonEnd = document.createElement('div')
    buttonEnd.setAttribute('class', 'buttonEnd');
    panel.buttonContainer.appendChild(buttonStart);
    panel.buttonContainer.appendChild(buttonCaption);
    panel.buttonContainer.appendChild(buttonEnd);
    buttonCaption.appendChild(document.createTextNode(panelName));
	buttonCaption.onselectstart = function () { return false; };
}

onload = function (){
  var tableCat = new createPanel( 'Table', 420, 170, 175, 300);
  var chatCat = new createPanel( 'Chat', 220, 26, 355, 130);
  var turnsCat = new createPanel( 'Turns', 6, 0, 175, 300);
  var toolsCat = new createPanel( 'Tools', 585, 26, 175, 300);
  var filesCat = new createPanel( 'Files', 775, 26, 175, 150);
  var element = document.getElementById('content');
  //element.onselectstart = function () { return false; } // ie
  //element.onmousedown = function () { return false; } // mozilla
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
  document.body.removeChild(panel.outerPanel);
  document.body.appendChild(panel.outerPanel);
}
