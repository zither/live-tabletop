LT.readTileImages = function(){
  var readTileImages = LT.ajaxRequest("POST", "php/read_images.php",{ 'type' : 'tile'});
  if (readTileImages.responseXML){
    var imageElements = readTileImages.responseXML.getElementsByTagName('image');
    LT.tileImages = {};
    for( var i = 0 ; i < imageElements.length; i++ ){
      var image = new LT.Image(imageElements[i]);
	  LT.tileImages[image.id] = image;
    }
  }
}

LT.readPieceImages = function(){
  var readPieceImages = LT.ajaxRequest("POST", "php/read_images.php",{ 'type' : 'piece'});
  if (readPieceImages.responseXML){
    var imageElements = readPieceImages.responseXML.getElementsByTagName('image');
    LT.pieceImages = {};
    for( var i = 0 ; i < imageElements.length; i++ ){
      var image = new LT.Image(imageElements[i]);
	  LT.pieceImages[image.id] = image;
    }
  }
}

LT.loadSwatches = function (){
  LT.selectedImageID = -1;
  LT.selectedImage = '';
  LT.fill(LT.tilesTab);
  var eraser = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 50px; width: 45px;',},
     LT.tilesTab, 'erase');
  eraser.onclick = function() {
	LT.selectedImageID = -1;
	LT.selectedImage = '';
  }
  var imagesArray = LT.sortObject(LT.tileImages, 'file');
  for( var i = 0 ; i < imagesArray.length; i++ ){
    newImage = LT.element('img', { title : imagesArray[i].file, 
	  'class' : 'swatch', 
	  src : 'images/upload/tile/' + imagesArray[i].file}, LT.tilesTab);
	newImage.id = imagesArray[i].id;
	newImage.file = imagesArray[i].file;
	newImage.onclick = function() {
	  LT.selectedImageID = this.id;
	}
  }
}
makeSelectPieceHandler = function (image) {
  return function () {
    if (LT.currentTable.tile_height) {
      var tileH = LT.currentTable.tile_height;
      var tileW = LT.currentTable.tile_width;
    } else {
      var tileH = LT.pForm.hInput.value;
      var tileW = LT.pForm.wInput.value;
    }
	var imageNLength = image.file.length -4;
	var imageName = image.file.substr(0, imageNLength);
    LT.selectedPieceImage = image.id;
    LT.pForm.yOff.setAttribute('value', (image.height - tileH) * -1 );
    LT.pForm.xOff.setAttribute('value', (image.width - tileW) / -2 );
	LT.pForm.pName.setAttribute('value', imageName);
  };
}
LT.loadPieceImages = function () {
  LT.fill(LT.pieceImageDiv);
  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
  for ( var i = 0 ; i < imagesArray.length; i++ ) {
    newImage = LT.element('img', { title : imagesArray[i].file, 
	  style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	  src : 'images/upload/piece/' + imagesArray[i].file}, LT.pieceImageDiv);
	newImage.onclick = makeSelectPieceHandler(imagesArray[i]);
  }
}

LT.loadPieces = function () {
  LT.fill(LT.pieceLayer);
  LT.fill(LT.clickPieceLayer);
  var readPieces = LT.ajaxRequest("POST", "php/read_pieces.php",{ 'table_id' : LT.currentTable.id });
  if (readPieces.responseXML) {
    var pieceElements = readPieces.responseXML.getElementsByTagName('piece');
    LT.pieces = [];
    for ( var i = 0 ; i < pieceElements.length; i++ ) {
      var piece = new LT.Piece(pieceElements[i]);
	  LT.pieces.push(piece);
	}
	var piecesArray = LT.sortObject(LT.pieces, 'id');
	for (var i = 0; i < LT.pieces.length; i++) {
	  generatePieceElements(i);
	}
  }
}
generatePieceElements = function (pieceID) {
      LT.pieces[pieceID].pieceDiv = LT.element('div', {
	    style : 'height: ' + LT.pieces[pieceID].height + 'px; '
          + 'width: ' + LT.pieces[pieceID].width + 'px; '
          + 'left: ' + LT.pieces[pieceID].x + 'px; '
          + 'top: ' + LT.pieces[pieceID].y + 'px; '
		  + 'position: absolute; background: #FFF;'}, LT.pieceLayer);
	  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
	  for ( var n = 0 ; n < imagesArray.length; n++ ) {
	    if (LT.pieces[pieceID].image_id == imagesArray[n].id) {
		   imageSource = imagesArray[n];
		}
	  }
	  LT.pieces[pieceID].pieceImage = LT.element('img', { 
	    style: ' margin-top: '
	      + LT.pieces[pieceID].y_offset + 'px; margin-left: ' 
	      + LT.pieces[pieceID].x_offset + 'px;',
	    src : 'images/upload/piece/' + imageSource.file}, LT.pieces[pieceID].pieceDiv);
	  LT.pieces[pieceID].movementPiece = LT.element('div', { 
	    title : LT.pieces[pieceID].name, // << this id is one number too high
	    style : 'position: absolute; height: '
          + imageSource.height + 'px; width: '
		  + imageSource.width + 'px; opacity: .5; '
          + 'left: ' + LT.pieces[pieceID].x
		  + 'px; top: ' + LT.pieces[pieceID].y
          + 'px; margin-left: ' + LT.pieces[pieceID].x_offset
		  + 'px; margin-top: ' + LT.pieces[pieceID].y_offset
		  + 'px; '}, LT.clickPieceLayer);
	   //var funcPiece = (LT.pieces[pieceID].id -1);
	   LT.pieces[pieceID].movementPiece.onmousedown = function () { 
	     movePiece(pieceID);
         return false; };
	   LT.pieces[pieceID].movementPiece.onmouseover = function () { 
	     highlightPiece(pieceID);
         return false; };
	   LT.pieces[pieceID].movementPiece.onmouseout = function () { 
	     unHighlightPiece(pieceID);
         return false; };
}
LT.updatePiece = function (pieceObject) {
  pieceObject.x = parseInt(pieceObject.pieceDiv.style.left);
  pieceObject.y = parseInt(pieceObject.pieceDiv.style.top);
  pieceObject.update({x: pieceObject.x, y: pieceObject.y});
  LT.selectedPiece = 0;
}
movePiece = function (pieceID) {
  LT.selectedPiece = LT.pieces[pieceID];
}
highlightPiece = function (pieceID) {
  LT.pieces[pieceID].movementPiece.style.border = '1px dotted black';
  LT.pieces[pieceID].movementPiece.style.margin =
    (LT.pieces[pieceID].y_offset -1) + 'px 0px 0px '
	+ (LT.pieces[pieceID].x_offset -1) + 'px';
}
unHighlightPiece = function (pieceID) {
  LT.pieces[pieceID].movementPiece.style.border = '0px';
  LT.pieces[pieceID].movementPiece.style.margin = 
    LT.pieces[pieceID].y_offset + 'px 0px 0px '
	+ LT.pieces[pieceID].x_offset + 'px';
}
LT.createPiece = function () {
  var createPieceAjax = LT.ajaxRequest("POST", "php/create_piece.php",
    { table_id : LT.currentTable.id, 
	  image_id : LT.selectedPieceImage, 
	  user_id : 0,
	  name : LT.pForm.pName.value,
	  x : LT.pForm.x.value,
	  y : LT.pForm.y.value, 
	  x_offset : LT.pForm.xOff.value,
	  y_offset : LT.pForm.yOff.value,
	  height : LT.pForm.hInput.value,
	  width : LT.pForm.wInput.value 
	}
  );
  LT.loadPieces();
}
populatePiecesTab = function () {
  //LT.piecesTab.style.overflow = 'scroll';
  LT.pForm = LT.element('form', { }, LT.piecesTab);
  var nameDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Name: ');
  LT.pForm.pName = LT.element('input', { size : 10, type: 'text',
    'class' : 'fInput' }, nameDiv, 'Piece Name', 1);
  var hDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Height: ');
  LT.pForm.hInput = LT.element('input', { size : 1, 
    'class' : 'fInput' }, hDiv, '0', 1);  
  var wDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Width: ');
  LT.pForm.wInput = LT.element('input', { size : 1, 
    'class' : 'fInput' }, wDiv, '0', 1);
  var yDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Y Pos: ');
  LT.pForm.y = LT.element('input', { size : 1, 
    'class' : 'fInput' }, yDiv, '0', 1);
  var xDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'X Pos: ');
  LT.pForm.x = LT.element('input', { size : 1, 
    'class' : 'fInput' }, xDiv, '0', 1);
  var hOffDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Height Offset: ');
  LT.pForm.yOff = LT.element('input', { size : 1, 
    'class' : 'fInput' }, hOffDiv, '0', 1);  
  var wOffDiv = LT.element('div', { 'class' : 'fLabel' }, LT.pForm, 'Width Offset: ');
  LT.pForm.xOff = LT.element('input', { size : 1, 
    'class' : 'fInput' }, wOffDiv, '0', 1);
  pSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.pForm);
  pSubmit.onclick = function() { LT.createPiece(); };
  LT.pieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: scroll;' }, LT.piecesTab, 'Columns: ');
  LT.loadPieceImages();
}

// Brings element to the forground
bringForward = function (cObject) {
  LT.fill(LT.clickLayers);
  LT.clickLayers.appendChild(cObject);
}
LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 210, 110);
  LT.toolsPanel.makeTab('Tiles', function () { bringForward(LT.clickTileLayer) });
  LT.toolsPanel.makeTab('Pieces', function () { bringForward(LT.clickPieceLayer) });
  LT.toolsPanel.makeTab('Fog', function () { bringForward(LT.clickFogLayer) });
  LT.toolsPanel.makeTab('Walls', function () { bringForward(LT.clickWallLayer) });
  LT.piecesTab = LT.toolsPanel.tabs[1].content;
  LT.fogTab = LT.toolsPanel.tabs[2].content;
  LT.tilesTab = LT.toolsPanel.tabs[0].content;
  populatePiecesTab();
  LT.element('div', {}, LT.fogTab, "YOU");
  LT.toolsPanel.selectTab(LT.toolsPanel.selectedTab);
};


// Move piece.
LT.movePiece = function () {
  var w = parseInt(LT.selectedPiece.pieceDiv.style.width);
  var h = parseInt(LT.selectedPiece.pieceDiv.style.height);
  if (LT.clickDragGap == 0) {
    LT.clickX = LT.dragX - parseInt(LT.selectedPiece.pieceDiv.style.left);
    LT.clickY = LT.dragY - parseInt(LT.selectedPiece.pieceDiv.style.top);
    LT.clickDragGap = 1;
  }
  var tableHeight = parseInt(LT.tableTop.style.height);
  var tableWidth = parseInt(LT.tableTop.style.width);
  LT.dragX = Math.min(LT.dragX - LT.clickX, tableWidth - w );
  LT.dragY = Math.min(LT.dragY - LT.clickY, tableHeight - h );
  LT.dragX = Math.max(LT.dragX, 0);
  LT.dragY = Math.max(LT.dragY, 0);
  LT.selectedPiece.pieceDiv.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceDiv.style.left = LT.dragX + "px";
  LT.selectedPiece.pieceImage.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceImage.style.left = LT.dragX + "px";
  LT.selectedPiece.movementPiece.style.top  = LT.dragY + "px";
  LT.selectedPiece.movementPiece.style.left = LT.dragX + "px";
}