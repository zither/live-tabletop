LT.readTileImages = function () {
  var readTileImages = LT.ajaxRequest("POST", "php/read_images.php", {'type' : 'tile'});
  if (readTileImages.responseXML) {
    var imageElements = readTileImages.responseXML.getElementsByTagName('image');
    LT.tileImages = {};
    for (var i = 0 ; i < imageElements.length; i++) {
      var image = new LT.Image(imageElements[i]);
      LT.tileImages[image.id] = image;
    }
  }
};

LT.readPieceImages = function () {
  var readPieceImages = LT.ajaxRequest("POST", "php/read_images.php", {'type' : 'piece'});
  if (readPieceImages.responseXML) {
    var imageElements = readPieceImages.responseXML.getElementsByTagName('image');
    LT.pieceImages = {};
    for (var i = 0 ; i < imageElements.length; i++) {
      var image = new LT.Image(imageElements[i]);
      LT.pieceImages[image.id] = image;
    }
  }
};

LT.loadSwatches = function () {
  LT.selectedImageID = -1;
  LT.selectedImage = '';
  LT.fill(LT.toolsTab.header);
  LT.fill(LT.toolsTab.content);
  var eraser = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 38px;',},
     LT.toolsTab.header, 'erase');
  eraser.onclick = function () {
    LT.selectedImageID = -1;
    LT.brush = "tile";
    LT.selectedImage = '';
    LT.bringForward(LT.clickTileLayer);
  }
  var fogTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 25px;',},
     LT.toolsTab.header, 'fog');
  fogTool.onclick = function () {
    LT.brush = "fog";
    LT.bringForward(LT.clickTileLayer);
  }
  var wallTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 25px;',},
     LT.toolsTab.header, 'wall');
  wallTool.onclick = function () {
    LT.brush = "wall";
    LT.bringForward(LT.clickWallLayer);
  }
  var pieceTool = LT.element('div', { style :
    'float : left; border : 1px solid black; margin : 1px 1px 1px 1px; height : 30px; width: 35px;',},
     LT.toolsTab.header, 'piece');
  pieceTool.onclick = function () {
    LT.brush = "piece";
    LT.bringForward(LT.clickPieceLayer);
  }
  
  LT.element('div', { 'class' : 'clearBoth' }, LT.toolsTab.header);
  
  var imagesArray = LT.sortObject(LT.tileImages, 'file');
  for (var i = 0 ; i < imagesArray.length; i++) {
    var newImage = LT.element('img', { title : imagesArray[i].file, 
      'class' : 'swatch', 
      src : 'images/upload/tile/' + imagesArray[i].file}, LT.toolsTab.content);
    newImage.id = imagesArray[i].id;
    newImage.file = imagesArray[i].file;
    newImage.onclick = function () {
      LT.selectedImageID = this.id;
      LT.bringForward(LT.clickTileLayer);
      LT.brush = "tile";
    }
  }
};

LT.loadPieceImages = function () {
  LT.fill(LT.editPieceImageDiv);
  LT.fill(LT.createPieceImageDiv);
  var imagesArray = LT.sortObject(LT.pieceImages, 'file');
  for (var i = 0 ; i < imagesArray.length; i++) {
    var cImage = LT.element('img', { title : imagesArray[i].file, 
      style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src : 'images/upload/piece/' + imagesArray[i].file}, LT.createPieceImageDiv);
    cImage.onclick = (function (image) {return function () {
      var imageName = image.file.substr(0, image.file.length - 4);
      LT.selectedPieceImage = image.id;
      LT.cPForm.yOff.setAttribute('value', (image.height - parseInt(LT.cPForm.hInput.value)) * -1);
      LT.cPForm.xOff.setAttribute('value', (image.width - parseInt(LT.cPForm.wInput.value)) / -2);
      LT.cPForm.pName.setAttribute('value', imageName);
    };})(imagesArray[i]);
    var eImage = LT.element('img', { title : imagesArray[i].file, 
      style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src : 'images/upload/piece/' + imagesArray[i].file}, LT.editPieceImageDiv);
    eImage.onclick = (function (obj) {return function () {
      LT.selectedEditPiece.image_id = obj.id;
      LT.ePForm.xOff.value = (obj.width - LT.selectedEditPiece.width) / -2;
      LT.ePForm.yOff.value = 0 - (obj.height - LT.selectedEditPiece.height);
    };})(imagesArray[i]);
  }
};

LT.loadPieces = function () {
  LT.fill(LT.pieceLayer);
  LT.fill(LT.clickPieceLayer);
  var readPieces = LT.ajaxRequest("POST", "php/read_pieces.php",{ 'table_id' : LT.currentTable.id });
  if (readPieces.responseXML) {
    var pieceElements = readPieces.responseXML.getElementsByTagName('piece');
    LT.pieces = [];
    for (var i = 0 ; i < pieceElements.length; i++) {
      var piece = new LT.Piece(pieceElements[i]);
      LT.pieces.push(piece);
    }
  }
};

LT.createPiece = function () {
  LT.ajaxRequest("POST", "php/create_piece.php", {
    table_id : LT.currentTable.id, 
    image_id : LT.selectedPieceImage,
    user_id : LT.users[LT.cPForm.userSelect.value].id,
    name : LT.cPForm.pName.value,
    x : LT.cPForm.x.value,
    y : LT.cPForm.y.value, 
    x_offset : LT.cPForm.xOff.value,
    y_offset : LT.cPForm.yOff.value,
    height : LT.cPForm.hInput.value,
    width : LT.cPForm.wInput.value,
  });
  LT.loadPieces();
}

LT.populateEditPiecesTab = function () {
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
  pSubmit.onclick = function () {
    LT.selectedEditPiece.edit();
  };
  pRemove = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Delete Piece' }, LT.ePForm);
  pRemove.onclick = function () {
    var confirmDel =  confirm('Are you sure you want to delete '
      + LT.selectedEditPiece.name + '?');
    if (confirmDel) { LT.selectedEditPiece.remove({}); }
  };
  LT.element('div', { 'class' : 'clearBoth' }, LT.editPiecesTab.header);
  LT.editPieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: none;' },
    LT.editPiecesTab.content, 'Columns: ');
}

LT.populateCreatePiecesTab = function () {
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
  pSubmit.onclick = function () { LT.createPiece(); };
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
  LT.toolsPanel = new LT.Panel('Pieces', 'Pieces', 6, 49, 140, 180);
  LT.createPiecesTab = LT.toolsPanel.makeTab('Create');
  LT.editPiecesTab = LT.toolsPanel.makeTab('Settings');
  LT.statsPiecesTab = LT.toolsPanel.makeTab('Stats');
  LT.populateEditPiecesTab();
  LT.populateCreatePiecesTab();
  LT.loadPieceImages();
  LT.toolsPanel.selectTab(LT.toolsPanel.selectedTab);
};

