// Populate table editing tools palette.
LT.createTools = function () {
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
  
  var imagesArray = LT.sortObject(LT.Tile.images, 'file');
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

// Populate image selectors in the create piece and piece settings tabs
LT.createPieceImages = function () {
  LT.fill(LT.editPieceImageDiv);
  LT.fill(LT.createPieceImageDiv);
  var imagesArray = LT.sortObject(LT.Piece.images, 'file');
  for (var i = 0 ; i < imagesArray.length; i++) {
    // Create an image for the create peice tab
    var creatorImage = LT.element('img', {
      title : imagesArray[i].file, 
      style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src : 'images/upload/piece/' + imagesArray[i].file
    }, LT.createPieceImageDiv);
    creatorImage.onclick = (function (image) {return function () {
      var imageName = image.file.substr(0, image.file.length - 4);
      LT.Piece.creator.selected = image.id;
      LT.Piece.creator.yOff.setAttribute('value', (image.height - parseInt(LT.Piece.creator.hInput.value)) * -1);
      LT.Piece.creator.xOff.setAttribute('value', (image.width - parseInt(LT.Piece.creator.wInput.value)) / -2);
      LT.Piece.creator.pName.setAttribute('value', imageName);
    };})(imagesArray[i]);
    // Create an image for the piece settings tab
    var editorImage = LT.element('img', {
      title : imagesArray[i].file, 
      style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src : 'images/upload/piece/' + imagesArray[i].file,
    }, LT.editPieceImageDiv);
    editorImage.onclick = (function (image) {return function () {
      LT.Piece.editor.selected = image.id;
      LT.Piece.editor.xOff.value = (image.width - LT.Piece.selected.width) / -2;
      LT.Piece.editor.yOff.value = 0 - (image.height - LT.Piece.selected.height);
    };})(imagesArray[i]);

  }
};

LT.loadPieces = function () {
  LT.fill(LT.pieceLayer);
  LT.fill(LT.clickPieceLayer);
  var readPieces = LT.ajaxRequest("POST", "php/read_pieces.php", { 'table_id' : LT.currentTable.id });
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
  if (LT.Piece.creator.selected == null) {
    alert("Cannot create piece. No piece image selected.");
    return;
  }
  LT.ajaxRequest("POST", "php/create_piece.php", {
    table_id : LT.currentTable.id, 
    image_id : LT.Piece.creator.selected,
    user_id : LT.users[LT.Piece.creator.userSelect.value].id,
    name : LT.Piece.creator.pName.value,
    x : LT.Piece.creator.x.value,
    y : LT.Piece.creator.y.value, 
    x_offset : LT.Piece.creator.xOff.value,
    y_offset : LT.Piece.creator.yOff.value,
    height : LT.Piece.creator.hInput.value,
    width : LT.Piece.creator.wInput.value,
  });
  LT.loadPieces();
}

// Brings element to the foreground
LT.bringForward = function (cObject) {
  LT.fill(LT.clickLayers);
  LT.clickLayers.appendChild(cObject);
}

LT.createToolsPanel = function () {
  LT.toolsPanel = new LT.Panel('Pieces', 'Pieces', 6, 49, 140, 180);
  var createPiecesTab = LT.toolsPanel.makeTab('Create');
  var editPiecesTab = LT.toolsPanel.makeTab('Settings');
  var statsPiecesTab = LT.toolsPanel.makeTab('Stats');

  // Populate edit pieces tab
  var form = LT.element('form', { }, editPiecesTab.header);
  LT.Piece.editor = {
    userSelect: LT.element('select', { size : 1, name : 'userSelect', style : 'width: 90px;' },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Owner: ')),
    pName: LT.element('input', { size : 10, type: 'text'},
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Name: '), 'Piece Name', true), 
    hInput: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Height: '), '0', true), 
    wInput: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Width: '), '0', true), 
    y: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Y Pos: '), '0', true), 
    x: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'X Pos: '), '0', true), 
    yOff: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Height Offset: '), '0', true), 
    xOff: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Width Offset: '), '0', true),
    selected: null,
  }
  pSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Apply Changes' }, form);
  pSubmit.onclick = function () {
    LT.Piece.selected.edit();
  };
  pRemove = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Delete Piece' }, form);
  pRemove.onclick = function () {
    var confirmDel =  confirm('Are you sure you want to delete '
      + LT.Piece.selected.name + '?');
    if (confirmDel) { LT.Piece.selected.remove({}); }
  };
  LT.element('div', { 'class' : 'clearBoth' }, editPiecesTab.header);
  LT.editPieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: none;' },
    editPiecesTab.content, 'Columns: ');

  // Populate create pieces tab
  form = LT.element('form', { }, createPiecesTab.header);
  LT.Piece.creator = {
    userSelect: LT.element('select', { size : 1, name : 'userSelect',  style : 'width: 90px;' },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Owner: ')),
    pName: LT.element('input', { size : 10, type: 'text'},
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Name: '), 'Piece Name', true), 
    hInput: LT.element('input', { size : 1 }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Height: '), '0', true), 
    wInput: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Width: '), '0', true), 
    y: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Y Pos: '), '0', true), 
    x: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'X Pos: '), '0', true), 
    yOff: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Height Offset: '), '0', true), 
    xOff: LT.element('input', { size : 1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Width Offset: '), '0', true), 
    selected: null,
  }
  pSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, form);
  pSubmit.onclick = function () { LT.createPiece(); };
  LT.element('div', { 'class' : 'clearBoth' }, createPiecesTab.header);
  LT.createPieceImageDiv = LT.element('div', { 'style' : 'clear: both; overflow: none;' },
    createPiecesTab.content, 'Columns: ');

  // TODO: Populate piece stats tab

  // is this redundant? See login.js
  LT.createPieceImages();

  // What does this do?
  LT.toolsPanel.selectTab(LT.toolsPanel.selectedTab);
};

