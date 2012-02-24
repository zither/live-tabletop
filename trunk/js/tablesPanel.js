LT.Table.readTables = function(){
  var readTablesAjax = LT.ajaxRequest("POST", "php/read_tables.php",{ });
  if (readTablesAjax.responseXML){
    var tableElements = readTablesAjax.responseXML.getElementsByTagName('table');
    var tableCookie = parseInt(LT.getCookie('table'));
    LT.tables = [];
    for( var i = 0 ; i < tableElements.length; i++ ){
      var table = new LT.Table(tableElements[i]);
      LT.tables.push(table);
      if (!LT.currentTable && LT.tables[i].id == tableCookie){
         LT.currentTable = LT.tables[i];
      }
    }
  }
}

LT.resizeLayer = function (pObject){
    pObject.setAttribute('style', 'width: ' + LT.currentTable.tile_width * 
      LT.currentTable.tile_columns + 'px; height: ' + LT.currentTable.tile_height *
      LT.currentTable.tile_rows + 'px;');
}

LT.Table.readTiles = function(){
  var readTiles = LT.ajaxRequest("POST", "php/read_tiles.php",{ 'table_id' : LT.currentTable.id });
  if (readTiles.responseXML){
    LT.fill(LT.tileLayer);
    LT.fill(LT.clickTileLayer);
    LT.fill(LT.fogLayer);
    LT.resizeLayer(LT.tabletop);
    LT.resizeLayer(LT.clickWallLayer);
    LT.tiles = [];
    var tileElements = readTiles.responseXML.getElementsByTagName('tiles');

    var tileText = decodeURIComponent(tileElements[0].textContent);
    var tilesArray = new Array();
    tilesArray = tileText.split(' ');
    for(i = 0; i < tilesArray.length; i++){
      x = i % LT.currentTable.tile_columns;
      y = Math.floor(i / LT.currentTable.tile_columns);
      var tile = new LT.Tile(LT.currentTable.id, x, y, tilesArray[i]);
      LT.tiles.push(tile);
    }
  }
}

LT.loadTable = function (table) {    
  if (table) {
    LT.currentTable = table;
  }
  if (LT.currentTable) {
    if (LT.currentTable.user_id == LT.currentUser.id 
      || LT.currentUser.permissions == 'administrator') {
      LT.piecesPanel.showTab(0);
      LT.piecesPanel.showTab(1);
      LT.tablesPanel.showTab(2);
      LT.tablesPanel.showTab(3);
    } else {
      if (LT.tablesPanel.currentTab == 2) {
        LT.tablesPanel.selectTab(0);
      }
      LT.piecesPanel.hideTab(0);
      LT.piecesPanel.hideTab(1);
      LT.tablesPanel.hideTab(2);
      LT.tablesPanel.hideTab(3);
      LT.bringForward(LT.clickPieceLayer);
    }
    LT.refreshTables;
    LT.currentTable.createGrid();

    LT.chatAlert();
    LT.chatAlert("Loading chat log for " + LT.currentTable.name + "...");
    LT.lastMessage = 0;
    LT.refreshMessageList();
    LT.chatAlert("Arriving at " + LT.currentTable.name);
    LT.chatAlert();

    LT.Table.readTiles();
    LT.loadPieces();
    document.cookie = 'table=' + LT.currentTable.id + ';';
    LT.Piece.creator.wInput.setAttribute('value', LT.currentTable.tile_width);
    LT.Piece.creator.hInput.setAttribute('value', LT.currentTable.tile_height);
    for ( i = 0; i < LT.Table.images.length; i++) {
      if (LT.Table.images[i].id == LT.currentTable.image_id) {
        LT.tabletop.style.background = "url('images/upload/background/" + 
          LT.Table.images[i].file + "')";
      }
    }
    var eTF = LT.Table.editForm;
    var cT = LT.currentTable;
    eTF.name.value = cT.name;
    eTF.cols.value = cT.tile_columns;
    eTF.rows.value = cT.tile_rows;
    eTF.tileHeight.value = cT.tile_height;
    eTF.tileWidth.value = cT.tile_width;
    eTF.gridThickness.value = cT.grid_thickness;
    eTF.wallThickness.value = cT.wall_thickness;
    eTF.background.selectedIndex = 0;
    for (i = 0; i < eTF.background.options.length; i++) {
      if (eTF.background.options[i].value == cT.image_id)
        eTF.background.selectedIndex = i;
    }
    for (i = 0; i < eTF.tileMode.options.length; i++) {
      if (eTF.tileMode.options[i].value == cT.tile_mode)
        eTF.tileMode.selectedIndex = i;
    }
  }
};

LT.refreshTables = function () {
  LT.Table.readTables();
  LT.fill(LT.tablesDiv);
  for (var i = 0 ; i < LT.tables.length; i++) {
    var tableLink = LT.element('a', {'class' : 'textButton'}, [LT.tables[i].name]);
    var tableDelete = LT.element('a', { 'class' : 'deleteButton' }, ['Delete']);
    tableLink.onclick = LT.loadTableHandler(LT.tables[i]);
    tableDelete.onclick = LT.deleteTableHandler(LT.tables[i]);
    LT.element(LT.tablesDiv, { 'style' : 'clear: both;' },
      [tableLink, tableDelete, [{'class': 'separator'}]]);
  }
};

LT.loadTableHandler = function (table) {
  return function () {LT.loadTable(table);};
}

LT.deleteTableHandler = function (table) {
  return function () {
    if (confirm('Are you sure you want to delete ' + table.name + '?')) {
      LT.ajaxRequest("POST", "php/delete_table.php", {'table_id': table.id });
      LT.refreshTables();
    }
  }
}

LT.createTablesPanel = function () {
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', 6, 26, 140, 180);
  LT.tablesPanel.makeTab('List');
  LT.tablesPanel.makeTab('Create');
  LT.tablesPanel.makeTab('Settings');
  LT.tablesPanel.makeTab('Tools', function () {
    LT.bringForward(LT.clickPieceLayer);
    LT.brush = "piece";
  });
  LT.button(LT.tablesPanel.tabs[0].content, 'Refresh',
    function() {LT.refreshTables();});
  LT.tablesDiv = LT.element(LT.tablesPanel.tabs[0].content);
  LT.refreshTables();
  populateCreateTableTab(LT.tablesPanel.tabs[1].content);
  populateEditTableTab(LT.tablesPanel.tabs[2].content);
  LT.toolsTab = LT.tablesPanel.tabs[3];
};

LT.genericTableForm = function (parent, actionName, actionHandler) {
  var form = {
    name: LT.text({size: 10}, 'Table Name'),
    cols: LT.text({size: 1}, '8'),
    rows: LT.text({size: 1}, '8'),
    tileWidth: LT.text({size: 1}, '45'),
    tileHeight: LT.text({size: 1}, '45'),
    gridThickness: LT.text({size: 1}, '1'),
    wallThickness: LT.text({size: 1}, '3'),
    submit: LT.button(actionName, actionHandler),
    background: LT.element('select', {style: {width: '135px'}, name: 'background'},
      [['option', {value: 0}, ['None']]]),
    tileMode: LT.element('select', {style: {width: '135px'}, name: 'tile_mode'}, [
      ['option', {value: 'rectangle'}, ['Rectangular Grid']],
      ['option', {value: 'isometric'}, ['Isometric Grid']],
      ['option', {value: 'hex rows'}, ['Hex Rows']],
      ['option', {value: 'hex columns'}, ['Hex Columns']],
    ]),
  };
  for (i = 0; i < LT.Table.images.length; i++) {
    var image = LT.Table.images[i];
    var imageName = image.file.substr(0, image.file.length - 4);
    LT.element(form.background, 'option', {value: image.id}, [imageName]);
  }
  LT.element(parent, 'form', [
    [{'class': 'inputDiv'}, ['Name: ', form.name]],
    [{'class': 'inputDiv'}, ['Background: ', form.background]],
    [{'class': 'inputDiv'}, ['Columns: ', form.cols]],
    [{'class': 'inputDiv'}, ['Rows: ', form.rows]],
    [{'class': 'inputDiv'}, ['Tile Height: ', form.tileWidth]],
    [{'class': 'inputDiv'}, ['Tile Width: ', form.tileHeight]],
    [{'class': 'inputDiv'}, ['Grid Thickness: ', form.gridThickness]],
    [{'class': 'inputDiv'}, ['Wall Thickness: ', form.wallThickness]],
    [{'class': 'inputDiv'}, ['Tile Mode: ', form.tileMode]],
    form.submit,
  ]);
  return form;
};

populateEditTableTab = function (tab) {
  LT.Table.editForm = LT.genericTableForm(tab, 'Apply Changes', function () {
    LT.currentTable.name = LT.Table.editForm.name.value;
    LT.currentTable.image_id = LT.Table.editForm.background.value;
    LT.currentTable.rows = LT.Table.editForm.rows.value;
    LT.currentTable.columns = LT.Table.editForm.cols.value;
    LT.currentTable.tile_height = LT.Table.editForm.tileHeight.value; 
    LT.currentTable.tile_width = LT.Table.editForm.tileWidth.value;
    LT.currentTable.tile_mode = LT.Table.editForm.tileMode.value;
    LT.currentTable.wall_thickness = LT.Table.editForm.wallThickness.value;
    LT.currentTable.grid_thickness = LT.Table.editForm.gridThickness.value;
    LT.currentTable.update({});
    LT.loadTable();
  });
};

populateCreateTableTab = function (tab) {
  var form = LT.genericTableForm(tab, 'Create Table', function () {
    LT.ajaxRequest("POST", "php/create_table.php", {
      default_tile: -1,
      name: form.name.value,
      image_id: form.background.value,
      rows: form.rows.value,
      columns: form.cols.value,
      tile_height: form.tileHeight.value, 
      tile_width: form.tileWidth.value,
      tile_mode: form.tileMode.value,
      wall_thickness: form.wallThickness.value,
      grid_thickness: form.gridThickness.value,
    });
    LT.refreshTables();
    for (var i = 0; i < LT.tables.length; i++) {
      if (LT.tables[i].name == form.name.value)
        LT.currentTable = LT.tables[i];
    }
    LT.loadTable();
  });
};

