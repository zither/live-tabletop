// Populate table editing tools palette.
LT.createTools = function () {
  LT.selectedImageID = -1;
  LT.selectedImage = '';
  LT.fill(LT.toolsTab.header);
  LT.fill(LT.toolsTab.content);
  var eraser = LT.element(LT.toolsTab.header, ['erase'], {id: 'eraser'});
  eraser.onclick = function () {
    LT.selectedImageID = -1;
    LT.brush = "tile";
    LT.selectedImage = '';
    LT.bringForward(LT.clickTileLayer);
  }
  var fogTool = LT.element(LT.toolsTab.header, ['fog'], {id: 'fogTool'});
  fogTool.onclick = function () {
    LT.brush = "fog";
    LT.bringForward(LT.clickTileLayer);
  }
  var wallTool = LT.element(LT.toolsTab.header, ['wall'], {id: 'wallTool'});
  wallTool.onclick = function () {
    LT.brush = "wall";
    LT.bringForward(LT.clickWallLayer);
  }
  var pieceTool = LT.element(LT.toolsTab.header, ['piece'], {id: 'pieceTool'});
  pieceTool.onclick = function () {
    LT.brush = "piece";
    LT.bringForward(LT.clickPieceLayer);
  }
  
  LT.element(LT.toolsTab.header, {'class': 'clearBoth'});
  
  var imagesArray = LT.sortObject(LT.Tile.images, 'file');
  for (var i = 0; i < imagesArray.length; i++) {
    var newImage = LT.element(LT.toolsTab.content, 'img', {
      'class': 'swatch', 
      title: imagesArray[i].file, 
      src: 'images/upload/tile/' + imagesArray[i].file,
    });
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
    var creatorImage = LT.element(LT.createPieceImageDiv, 'img', {
      title: imagesArray[i].file, 
      style: 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src: 'images/upload/piece/' + imagesArray[i].file
    });
    creatorImage.onclick = (function (image) {return function () {
      var imageName = image.file.substr(0, image.file.length - 4);
      LT.Piece.creator.selected = image.id;
      LT.Piece.creator.yOff.setAttribute('value', (image.height - parseInt(LT.Piece.creator.hInput.value)) * -1);
      LT.Piece.creator.xOff.setAttribute('value', (image.width - parseInt(LT.Piece.creator.wInput.value)) / -2);
      LT.Piece.creator.pName.setAttribute('value', imageName);
    };})(imagesArray[i]);
    // Create an image for the piece settings tab
    var editorImage = LT.element(LT.editPieceImageDiv, 'img', {
      title : imagesArray[i].file, 
      style : 'border: 1px solid black; margin: 1px 1px 1px 1px', 
      src : 'images/upload/piece/' + imagesArray[i].file,
    });
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

LT.Piece.readStats = function () {
  LT.Piece.statEditor.form.style.display = 'block';
  LT.fill(LT.Piece.statList);
  LT.element(LT.Piece.statList, {'class' : 'separator'});  
  LT.Piece.stats = LT.Piece.selected.getStats();
  for (i = 0; i < LT.Piece.stats.length; i++) {
    var rowDiv = LT.element(LT.Piece.statList, {'style': 'clear: both;'});
    LT.element(rowDiv, 'span', {style: 'float: left;'}, [LT.Piece.stats[i].name + ': ']);
    LT.Piece.stats[i].valueInput = LT.text(rowDiv, {size: 1}, LT.Piece.stats[i].value);
    LT.Piece.stats[i].deleteButton = LT.element(rowDiv, {'class': 'buttonDiv'}, ['-']);
    LT.Piece.stats[i].deleteButton.onclick = 
      LT.Piece.deleteStatHandler(LT.Piece.stats[i].name);
  }
  LT.Piece.statList.submit = LT.button(LT.Piece.statList, 'Apply Changes');
  LT.Piece.statList.submit.onclick = function () {LT.Piece.updateStats();};
}
LT.Piece.deleteStatHandler = function (statName) {
  return function () {
    LT.Piece.selected.deleteStat(statName);
    LT.Piece.readStats();
  };
};
LT.Piece.updateStats = function () {
  for( i = 0; i < LT.Piece.stats.length; i++ ){
    LT.Piece.selected.setStat( LT.Piece.stats[i].name, 
      LT.Piece.stats[i].valueInput.value);
  }
  LT.Piece.readStats();
}

LT.Piece.addStat = function () {
  LT.Piece.selected.setStat( LT.Piece.statEditor.newStatName.value, 
    LT.Piece.statEditor.newStatValue.value);
  LT.Piece.readStats();
}

// Brings element to the foreground
LT.bringForward = function (cObject) {
  LT.fill(LT.clickLayers);
  LT.clickLayers.appendChild(cObject);
}

LT.genericPieceForm = function (parent) {
  var form = {
    userSelect: LT.element('select', {size: 1, name: 'userSelect', style: 'width: 90px;'}),
    pName: LT.text('input', {size: 10, type: 'text'}, 'Piece Name'),
    hInput: LT.text('input', {size: 1}, '0'),
    wInput: LT.text('input', {size: 1}, '0'),
    y: LT.text('input', {size: 1}, '0'),
    x: LT.text('input', {size: 1}, '0'),
    yOff: LT.text('input', {size: 1}, '0'),
    xOff: LT.text('input', {size: 1}, '0'),
    selected: null,
  }
  form.form = LT.element(parent, 'form', [
    [{'class': 'inputDiv'}, ['Owner: ', form.userSelect]],
    [{'class': 'inputDiv'}, ['Name: ', form.pName]],
    [{'class': 'inputDiv'}, ['Height: ', form.hInput]],
    [{'class': 'inputDiv'}, ['Width: ', form.wInput]],
    [{'class': 'inputDiv'}, ['Y Pos: ', form.x]],
    [{'class': 'inputDiv'}, ['X Pos: ', form.y]],
    [{'class': 'inputDiv'}, ['Height Offset: ', form.xOff]], 
    [{'class': 'inputDiv'}, ['Width Offset: ', form.yOff]],
  ]);
  return form;
}

LT.createPiecesPanel = function () {
  LT.piecesPanel = new LT.Panel('Pieces', 'Pieces', 6, 49, 140, 180);
  var createPiecesTab = LT.piecesPanel.makeTab('Create');
  var editPiecesTab = LT.piecesPanel.makeTab('Settings');
  var statsPiecesTab = LT.piecesPanel.makeTab('Stats');
  // Populate edit pieces tab
  LT.Piece.editor = LT.genericPieceForm(editPiecesTab.header);
  LT.button(LT.Piece.editor.form, 'Apply Changes', function () {
    LT.Piece.selected.edit();
  });
  LT.button(LT.Piece.editor.form, 'Delete Piece', function () {
    if (confirm('Are you sure you want to delete '
      + LT.Piece.selected.name + '?')) LT.Piece.selected.remove({});
  });
  LT.element(editPiecesTab.header, {'class': 'clearBoth'});
  LT.editPieceImageDiv = LT.element(editPiecesTab.content, ['Columns: '],
    {'style': 'clear: both; overflow: none;'});

  // Populate create pieces tab
  LT.Piece.creator = LT.genericPieceForm(createPiecesTab.header);
  LT.button(LT.Piece.creator.form, 'Create', {'clear': 'both'}, function () {
    LT.createPiece();
  });
  LT.element(createPiecesTab.header, {'class': 'clearBoth'});
  LT.createPieceImageDiv = LT.element(createPiecesTab.content, ['Columns: '],
    {'style' : 'clear: both; overflow: none;'});

  //Populate piece stats tab
  LT.Piece.statList = LT.element(statsPiecesTab.content);
  var statEditorForm = LT.element(statsPiecesTab.header, {style: {display: 'none'}});
  LT.Piece.statEditor = {
    form: statEditorForm,
    newStatName: LT.text(statEditorForm, {size : 2}, 'Stat'),
    newStatValue: LT.text(statEditorForm, {size : 2}, 'Value'),
    addStat: LT.element(statEditorForm, {'class' : 'buttonDiv'}, ['+'])
  }
  LT.Piece.statEditor.addStat.onclick = function () {LT.Piece.addStat();};
  LT.element({'class' : 'clearBoth'}, LT.Piece.statEditor.form);
  // TODO: is this redundant? See login.js
  LT.createPieceImages();
};

