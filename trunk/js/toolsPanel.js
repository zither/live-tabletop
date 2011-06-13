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
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 45px; width: 45px;',},
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
	  var tileH = LT.pForm.hInput.value;
	  var tileW = LT.pForm.wInput.value;
	  LT.pForm.yOff.setAttribute('value', LT.currentTable.tile_height);
	  LT.selectedImageID = this.id;
	}
  }
}
LT.loadPieceImages = function (){
  LT.fill(LT.pieceImageDiv);
  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
  for( var i = 0 ; i < imagesArray.length; i++ ){
    newImage = LT.element('img', { title : imagesArray[i].file, 
	  style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	  src : 'images/upload/piece/' + imagesArray[i].file}, LT.pieceImageDiv);
	newImage.id = imagesArray[i].id;
	newImage.file = imagesArray[i].file;
	newImage.onclick = function() {
      LT.selectedPieceImage = this.id;
	}
  }
}

LT.loadPieces = function (){
  LT.fill(LT.pieceLayer);
  var readPieces = LT.ajaxRequest("POST", "php/read_pieces.php",{ 'table_id' : LT.currentTable.id });
  if (readPieces.responseXML){
    var pieceElements = readPieces.responseXML.getElementsByTagName('piece');
    LT.pieces = {};
    for( var i = 0 ; i < pieceElements.length; i++ ){
      var piece = new LT.Piece(pieceElements[i]);
	  LT.pieces[piece.id] = piece;
	}
	var piecesArray = LT.sortObject(LT.pieces, 'id');
	for( var i = 0; i < piecesArray.length; i++) {
      var newPiece = LT.element('div', { title : piecesArray[i].id, 
	  style : 'height: ' + piecesArray[i].height + 'px; '
        + 'width: ' + piecesArray[i].width + 'px; '
        + 'margin-left: ' + piecesArray[i].x + 'px; '
        + 'margin-top: ' + piecesArray[i].y + 'px; '
		+ 'position: absolute; background: #FFF;'}, LT.pieceLayer);
	  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
	  for ( var n = 0 ; n < imagesArray.length; n++ ) {
	    if (piecesArray[i].image_id == imagesArray[n].id) {
		   imageSource = imagesArray[n].file;
		}
	  }
	  var pieceImage = LT.element('img', {
	    src : 'images/upload/piece/' + imageSource}, newPiece, imageSource);
    }
  }
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

LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', 6, 95, 210, 110);
  LT.toolsPanel.makeTab('Tiles', LT.bringForward(LT.tableTop, LT.clickTileLayer));
  LT.toolsPanel.makeTab('Pieces', LT.bringForward(LT.tableTop, LT.clickPieceLayer));
  LT.toolsPanel.makeTab('Fog', LT.bringForward(LT.tableTop, LT.clickFogLayer));
  LT.toolsPanel.makeTab('Walls', LT.bringForward(LT.tableTop, LT.clickWallLayer));
  LT.piecesTab = LT.toolsPanel.tabs[1].content;
  LT.fogTab = LT.toolsPanel.tabs[2].content;
  LT.tilesTab = LT.toolsPanel.tabs[0].content;
  populatePiecesTab();
  LT.element('div', {}, LT.fogTab, "YOU");
};

