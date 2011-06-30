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
  LT.fill(LT.toolsTab.header);
  LT.fill(LT.toolsTab.content);
  var eraser = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 38px;',},
     LT.toolsTab.header, 'erase');
  eraser.onclick = function() {
	LT.selectedImageID = -1;
    LT.brush = "tile";
	LT.selectedImage = '';
	LT.bringForward(LT.clickTileLayer);
  }
  var fogTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 25px;',},
     LT.toolsTab.header, 'fog');
  fogTool.onclick = function() {
    LT.brush = "fog";
	LT.bringForward(LT.clickTileLayer);
  }
  var wallTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 25px;',},
     LT.toolsTab.header, 'wall');
  wallTool.onclick = function() {
    LT.brush = "wall";
	LT.bringForward(LT.clickWallLayer);
  }
  var pieceTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 35px;',},
     LT.toolsTab.header, 'piece');
  pieceTool.onclick = function() {
    LT.brush = "piece";
	LT.bringForward(LT.clickPieceLayer);
  }
  
  LT.element('div', { 'class' : 'clearBoth' }, LT.toolsTab.header);
  
  var imagesArray = LT.sortObject(LT.tileImages, 'file');
  for( var i = 0 ; i < imagesArray.length; i++ ){
    var newImage = LT.element('img', { title : imagesArray[i].file, 
	  'class' : 'swatch', 
	  src : 'images/upload/tile/' + imagesArray[i].file}, LT.toolsTab.content);
	newImage.id = imagesArray[i].id;
	newImage.file = imagesArray[i].file;
	newImage.onclick = function() {
	  LT.selectedImageID = this.id;
	  LT.bringForward(LT.clickTileLayer);
      LT.brush = "tile";
	}
  }
}
createPieceImageHandler = function (image) {
  return function () {
    if (LT.currentTable.tile_height) {
      var tileH = LT.currentTable.tile_height;
      var tileW = LT.currentTable.tile_width;
    } else {
      var tileH = LT.cPForm.hInput.value;
      var tileW = LT.cPForm.wInput.value;
    }
	var imageNLength = image.file.length -4;
	var imageName = image.file.substr(0, imageNLength);
    LT.selectedPieceImage = image.id;
    LT.cPForm.yOff.setAttribute('value', (image.height - parseInt(LT.cPForm.hInput.value)) * -1 );
    LT.cPForm.xOff.setAttribute('value', (image.width - parseInt(LT.cPForm.wInput.value)) / -2 );
	LT.cPForm.pName.setAttribute('value', imageName);
  };
}
LT.loadPieceImages = function () {
  LT.fill(LT.editPieceImageDiv);
  LT.fill(LT.createPieceImageDiv);
  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
  for ( var i = 0 ; i < imagesArray.length; i++ ) {
    var cImage = LT.element('img', { title : imagesArray[i].file, 
	  style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	  src : 'images/upload/piece/' + imagesArray[i].file}, LT.createPieceImageDiv);
	cImage.onclick = createPieceImageHandler(imagesArray[i]);
    var eImage = LT.element('img', { title : imagesArray[i].file, 
	  style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
	  src : 'images/upload/piece/' + imagesArray[i].file}, LT.editPieceImageDiv);
	eImage.onclick = editPieceImageHandler(imagesArray[i]);
  }
}
editPieceImageHandler = function (obj) {
  return function () {
    if (LT.currentTable.tile_height) {
      var tileH = LT.currentTable.tile_height;
      var tileW = LT.currentTable.tile_width;
    } else {
      var tileH = LT.ePForm.hInput.value;
      var tileW = LT.ePForm.wInput.value;
    }
	LT.selectedEditPiece.image_id = obj.id;
    LT.ePForm.xOff.value = (obj.width - LT.selectedEditPiece.width) / -2;
    LT.ePForm.yOff.value = 0 - (obj.height - LT.selectedEditPiece.height);
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
    + 'position: absolute;'}, LT.pieceLayer);
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
    title : LT.pieces[pieceID].name,
    style : 'position: absolute; height: '
      + imageSource.height + 'px; width: '
	  + imageSource.width + 'px; opacity: .8; '
      + 'left: ' + LT.pieces[pieceID].x
	  + 'px; top: ' + LT.pieces[pieceID].y
      + 'px; margin-left: ' + LT.pieces[pieceID].x_offset
	  + 'px; margin-top: ' + LT.pieces[pieceID].y_offset
	  + 'px; '}, LT.clickPieceLayer);
  if (LT.selectedPiece) {  
	if ( LT.pieces[pieceID].id == LT.selectedPiece.id ) {
    LT.pieces[pieceID].movementPiece.style.border = '1px dashed black';
    LT.pieces[pieceID].movementPiece.style.margin =
      (LT.pieces[pieceID].y_offset -1) + 'px 0px 0px '
      + (LT.pieces[pieceID].x_offset -1) + 'px';
    }
  }

  if (LT.currentTable.user_id == LT.currentUser.id 
    || LT.pieces[pieceID].user_id == LT.currentUser.id 
    || LT.currentUser.permissions == 'administrator') {
    LT.pieces[pieceID].movementPiece.onmousedown = function () {
      movePiece(pieceID);
      LT.placingPiece = 1;
      return false; 
    };
    LT.pieces[pieceID].movementPiece.onmouseover = function () { 
      LT.pieces[pieceID].pieceDiv.style.background = '#FFF';
      return false;
    };
      LT.pieces[pieceID].movementPiece.onmouseout = function () { 
      LT.pieces[pieceID].pieceDiv.style.background = '';
      return false;
    };
  }
}
LT.placePiece = function (pieceObject) {
  pieceObject.x = parseInt(pieceObject.pieceDiv.style.left);
  pieceObject.y = parseInt(pieceObject.pieceDiv.style.top);
  pieceObject.update({});
  LT.isPieceMoving = 0;
}
movePiece = function (pieceID) {
  LT.selectedPiece = LT.pieces[pieceID];
  LT.isPieceMoving = 1;
  for ( i = 0; i < LT.pieces.length; i++ ) {
    unhighlightPiece(i);
  }
  highlightPiece(pieceID);
}
highlightPiece = function (pieceID) {
  LT.pieces[pieceID].pieceDiv.style.background = '#FFF';
  LT.pieces[pieceID].movementPiece.style.border = '1px dashed black';
  LT.pieces[pieceID].movementPiece.style.margin =
    (LT.pieces[pieceID].y_offset -1) + 'px 0px 0px '
	+ (LT.pieces[pieceID].x_offset -1) + 'px';
}
unhighlightPiece = function (pieceID) {
  LT.pieces[pieceID].movementPiece.style.border = '0px';
  LT.pieces[pieceID].movementPiece.style.margin = 
    LT.pieces[pieceID].y_offset + 'px 0px 0px '
	+ LT.pieces[pieceID].x_offset + 'px';
}
LT.createPiece = function () {
  var createPieceAjax = LT.ajaxRequest("POST", "php/create_piece.php",
    { table_id : LT.currentTable.id, 
	  image_id : LT.selectedPieceImage,
	  user_id : LT.users[LT.cPForm.userSelect.value].id,
	  name : LT.cPForm.pName.value,
	  x : LT.cPForm.x.value,
	  y : LT.cPForm.y.value, 
	  x_offset : LT.cPForm.xOff.value,
	  y_offset : LT.cPForm.yOff.value,
	  height : LT.cPForm.hInput.value,
	  width : LT.cPForm.wInput.value 
	}
  );
  LT.loadPieces();
}
populateEditPiecesTab = function () {
  LT.ePForm = LT.element('form', { }, LT.editPiecesTab.header);
  var userDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Owner: ');
  LT.ePForm.userSelect = LT.element('select', { size : 1, name : 'userSelect', 
    style : 'width: 90px;' }, userDiv);
  var nameDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Name: ');
  LT.ePForm.pName = LT.element('input', { size : 10, type: 'text',
     }, nameDiv, 'Piece Name', 1);
  var hDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Height: ');
  LT.ePForm.hInput = LT.element('input', { size : 1 }, hDiv, '0', 1);  
  var wDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Width: ');
  LT.ePForm.wInput = LT.element('input', { size : 1 }, wDiv, '0', 1);
  var yDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Y Pos: ');
  LT.ePForm.y = LT.element('input', { size : 1 }, yDiv, '0', 1);
  var xDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'X Pos: ');
  LT.ePForm.x = LT.element('input', { size : 1 }, xDiv, '0', 1);
  var hOffDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Height Offset: ');
  LT.ePForm.yOff = LT.element('input', { size : 1 }, hOffDiv, '0', 1);  
  var wOffDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.ePForm, 'Width Offset: ');
  LT.ePForm.xOff = LT.element('input', { size : 1 }, wOffDiv, '0', 1);
  pSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Apply Changes' }, LT.ePForm);
  pSubmit.onclick = function() {
    LT.editPieceHandler(LT.selectedEditPiece);
  };
  pRemove = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Delete Piece' }, LT.ePForm);
  pRemove.onclick = function() {
    var confirmDel =  confirm('Are you sure you want to delete '
      + LT.selectedEditPiece.name + '?');
    if (confirmDel) { LT.selectedEditPiece.remove({}); }
  };
  LT.element('div', { 'class' : 'clearBoth' }, LT.editPiecesTab.header);
  LT.editPieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: none;' },
    LT.editPiecesTab.content, 'Columns: ');
}
populateCreatePiecesTab = function () {
  LT.cPForm = LT.element('form', { }, LT.createPiecesTab.header);
  var userDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Owner: ');
  LT.cPForm.userSelect = LT.element('select', { size : 1, name : 'userSelect', 
    style : 'width: 90px;' }, userDiv);
  var nameDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Name: ');
  LT.cPForm.pName = LT.element('input', { size : 10, type: 'text',
     }, nameDiv, 'Piece Name', 1);
  var hDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Height: ');
  LT.cPForm.hInput = LT.element('input', { size : 1 }, hDiv, '0', 1);  
  var wDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Width: ');
  LT.cPForm.wInput = LT.element('input', { size : 1 }, wDiv, '0', 1);
  var yDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Y Pos: ');
  LT.cPForm.y = LT.element('input', { size : 1 }, yDiv, '0', 1);
  var xDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'X Pos: ');
  LT.cPForm.x = LT.element('input', { size : 1 }, xDiv, '0', 1);
  var hOffDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Height Offset: ');
  LT.cPForm.yOff = LT.element('input', { size : 1 }, hOffDiv, '0', 1);  
  var wOffDiv = LT.element('div', { 'class' : 'inputDiv' }, LT.cPForm, 'Width Offset: ');
  LT.cPForm.xOff = LT.element('input', { size : 1 }, wOffDiv, '0', 1);
  pSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.cPForm);
  pSubmit.onclick = function() { LT.createPiece(); };
  LT.element('div', { 'class' : 'clearBoth' }, LT.createPiecesTab.header);
  LT.createPieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: none;' },
    LT.createPiecesTab.content, 'Columns: ');
}

// Brings element to the forground
LT.bringForward = function (cObject) {
  LT.fill(LT.clickLayers);
  LT.clickLayers.appendChild(cObject);
}
LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel( 'Pieces', 'Pieces', 6, 49, 140, 180);
  LT.toolsPanel.makeTab('Create');
  LT.createPiecesTab = LT.toolsPanel.tabs[0];
  LT.toolsPanel.makeTab('Settings');
  LT.editPiecesTab = LT.toolsPanel.tabs[1];
  LT.toolsPanel.makeTab('Stats');
  LT.statsPiecesTab = LT.toolsPanel.tabs[2];
  populateEditPiecesTab();
  populateCreatePiecesTab();
  LT.loadPieceImages();
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
  if (LT.currentTable.tile_height) {
    var tileH = LT.currentTable.tile_height;
    var tileW = LT.currentTable.tile_width;
	LT.dragY = LT.dragY - (LT.dragY % tileH);
	LT.dragX = LT.dragX - (LT.dragX % tileW);
  }
  LT.selectedPiece.pieceDiv.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceDiv.style.left = LT.dragX + "px";
  LT.selectedPiece.pieceImage.style.top  = LT.dragY + "px";
  LT.selectedPiece.pieceImage.style.left = LT.dragX + "px";
  LT.selectedPiece.movementPiece.style.top  = LT.dragY + "px";
  LT.selectedPiece.movementPiece.style.left = LT.dragX + "px";
}

LT.getEditPiece = function (piece) {
  if (LT.currentTable.tile_height) {
    var tileH = LT.currentTable.tile_height;
    var tileW = LT.currentTable.tile_width;
  } else {
    var tileH = LT.ePForm.hInput.value;
    var tileW = LT.ePForm.wInput.value;
  }
  LT.selectedEditPiece = piece;
  for ( i = 0; i < LT.ePForm.userSelect.childNodes.length; i++) {
    var option = LT.ePForm.userSelect.childNodes[i];
	option.removeAttribute('selected');
  }
  for ( i = 0; i < LT.ePForm.userSelect.childNodes.length; i++) {
    var option = LT.ePForm.userSelect.childNodes[i];
    if (LT.users[option.value].id == piece.user_id) {
	  option.setAttribute('selected', 'select');
	}
  }
  LT.ePForm.pName.value = piece.name;
  LT.ePForm.x.value = piece.x;
  LT.ePForm.y.value = piece.y;
  LT.ePForm.xOff.value = piece.x_offset;
  LT.ePForm.yOff.value = piece.y_offset;
  LT.ePForm.wInput.value = piece.width;
  LT.ePForm.hInput.value = piece.height;
}

LT.editPieceHandler = function (piece) {
  var user = LT.users[LT.ePForm.userSelect.value];
  piece.user_id = user.id;
  piece.image_id = LT.selectedEditPiece.image_id;
  piece.name = LT.ePForm.pName.value;
  piece.x = LT.ePForm.x.value;
  piece.y = LT.ePForm.y.value
  piece.x_offset = LT.ePForm.xOff.value;
  piece.y_offset = LT.ePForm.yOff.value;
  piece.width = LT.ePForm.wInput.value;
  piece.height = LT.ePForm.hInput.value;
  piece.update({});
}