LT.readTables = function(){
  var readTablesAjax = LT.ajaxRequest("POST", "php/read_tables.php",{ });
  if (readTablesAjax.responseXML){
    var tableElements = readTablesAjax.responseXML.getElementsByTagName('table');
    LT.tables = [];
    for( var i = 0 ; i < tableElements.length; i++ ){
      var table = new LT.Table(tableElements[i]);
      LT.tables.push(table);
    }
	if (!LT.currentTable){
       LT.currentTable = LT.tables[0];
	}else{
	  LT.currentTable = {};
	}
  }
}

LT.resizeLayer = function (pObject){
    pObject.setAttribute('style', 'width: ' + LT.currentTable.tile_width * 
      LT.currentTable.tile_columns + 'px; height: ' + LT.currentTable.tile_height *
      LT.currentTable.tile_rows + 'px;');
}

LT.readTiles = function(){
  var readTiles = LT.ajaxRequest("POST", "php/read_tiles.php",{ 'table_id' : LT.currentTable.id });
  if (readTiles.responseXML){
    LT.fill(LT.tileLayer);
    LT.fill(LT.clickTileLayer);
	LT.resizeLayer(LT.tableTop);
	LT.resizeLayer(LT.clickWallLayer);
	LT.resizeLayer(LT.clickFogLayer);
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
    //LT.sortAllTileLayers();
  }
}

LT.loadTable = function (tableID) {
  for( i=0; i<LT.tables.length; i++ ){
    if(LT.tables[i].id == tableID){
	  LT.currentTable = LT.tables[i];
	}
  }
  if(LT.currentTable){
    LT.currentTable.createGrid();
    LT.element('br', {}, LT.chatOutput);
    LT.element('div', {'class' : 'chat_alert'}, LT.chatOutput, 
      "Loading chat log for " + LT.currentTable.name + "...");
    LT.lastMessage = 0;
    LT.refreshMessageList();
    LT.element('a', {'class' : 'chat_alert'}, LT.chatOutput, 
      "Arriving at " + LT.currentTable.name);
    LT.element('br', {}, LT.chatOutput);
    LT.chatOutput.removeChild(LT.chatBottom);
    LT.chatOutput.appendChild(LT.chatBottom);
    LT.chatBottom.scrollIntoView(true);
    LT.readTiles();
    LT.loadPieces();
    document.cookie = 'table=' + LT.currentTable.id + ';';
    LT.pForm.wInput.setAttribute('value', LT.currentTable.tile_width);
    LT.pForm.hInput.setAttribute('value', LT.currentTable.tile_height);
	
    var eTF = LT.editTablesForm
	var cT = LT.currentTable
	eTF.inputTableName.setAttribute('value', cT.name);
	eTF.inputTableCols.setAttribute('value', cT.tile_columns);
	eTF.inputTableRows.setAttribute('value', cT.tile_rows);
	eTF.inputTileHeight.setAttribute('value', cT.tile_height);
	eTF.inputTileWidth.setAttribute('value', cT.tile_width);
	eTF.inputGridThickness.setAttribute('value', cT.grid_thickness);
	eTF.inputWallThickness.setAttribute('value', cT.wall_thickness);
	eTF.inputTMRectangle.removeAttribute('selected');
	eTF.inputTMIsometric.removeAttribute('selected');
	eTF.inputTMHexColumns.removeAttribute('selected');
	eTF.inputTMHexRows.removeAttribute('selected');
	if (cT.tile_mode == 'rectangle') {
	  eTF.inputTMRectangle.setAttribute('selected', 'select');
	}
	if (cT.tile_mode == 'isometric') {
	  eTF.inputTMIsometric.setAttribute('selected', 'select');
	}
	if (cT.tile_mode == 'hex columns') {
	  eTF.inputTMHexColumns.setAttribute('selected', 'select');
	}
	if (cT.tile_mode == 'hex rows') {
	  eTF.inputTMHexRows.setAttribute('selected', 'select');
	}
  }
}  

LT.refreshTables = function () {
  LT.readTables();
  LT.readTileImages();
  LT.readPieceImages();
  LT.fill(LT.tablesDiv);
  for( var i = 0 ; i < LT.tables.length; i++ ){	
    tableEntry = LT.element('div', { 'style' : 'clear: both;' }, LT.tablesDiv, ' ')
    var tableLink = LT.element('a', {'class' : 'textButton'}, tableEntry, LT.tables[i].name);
	tableLink.name = LT.tables[i].name;
	tableLink.id = LT.tables[i].id;
	tableLink.table = i;
	tableLink.onclick = function(){
	  LT.loadTable(this.id);
	};
    tableDelete = LT.element('a', { 'class' : 'deleteButton' }, tableEntry, 'Delete');
    tableDelete.id = LT.tables[i].id;
    tableDelete.onclick = function(){
        //var deleteTable = function(){LT.tables[i].remove;};
      var deleteTable = LT.ajaxRequest("POST", "php/delete_table.php",{ 'table_id' : this.id });
	  LT.refreshTables();
    };
    LT.element('div',{'class' : 'separator'}, tableEntry);
  }
}

LT.createTablesPanel = function () {
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', 6, 26, 300, 125);
  LT.tablesPanel.makeTab('List');
  LT.tablesPanel.makeTab('Edit');
  LT.tablesPanel.makeTab('Create');
  LT.tablesTab = LT.tablesPanel.tabs[0].content;
  LT.editTableTab = LT.tablesPanel.tabs[1].content;
  LT.createTableTab = LT.tablesPanel.tabs[2].content;
  LT.tablesDiv = LT.element('div',{}, LT.tablesTab);
  LT.refreshTables();  
  populateCreateTableTab();
  populateEditTableTab();

};

populateEditTableTab = function () {
  LT.editTablesForm = LT.element('form', { }, LT.editTableTab);
  var eTF = LT.editTablesForm
  var nameDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Name: ');
  eTF.inputTableName = LT.element('input', { size : 10, type: 'text',
    style : 'border: 1px solid #CCC;' }, nameDiv);
  var columnsDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Columns: ');
  eTF.inputTableCols = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, columnsDiv);
  var rowsDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Rows: ');
  eTF.inputTableRows = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, rowsDiv);
  var heightDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Tile Height: ');
  eTF.inputTileHeight = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, heightDiv);
  var widthDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Tile Width: ');
  eTF.inputTileWidth = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, widthDiv);
  var thicknessDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Grid Thickness: ');
  eTF.inputGridThickness = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, thicknessDiv, '1', 1);
  var wallThicknessDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Wall Thickness: ');
  eTF.inputWallThickness = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, wallThicknessDiv, '1', 1);
  var tileModeDiv = LT.element('div', { 'class' : 'inputDiv' }, eTF, 'Tile Mode: ');
  eTF.inputTileMode = LT.element('select', { size : 1, name : 'eTileMode', 
    style : 'border: 1px solid #CCC;' }, tileModeDiv);
  eTF.inputTMRectangle = LT.element('option', { value : 'rectangle'},
    eTF.inputTileMode, 'Rectangles');
  eTF.inputTMIsometric = LT.element('option', { value : 'isometric'},
    eTF.inputTileMode, 'Isometric');
  eTF.inputTMHexRows = LT.element('option', { value : 'hex rows'},
    eTF.inputTileMode, 'Hex rows');
  eTF.inputTMHexColumns = LT.element('option', { value : 'hex columns'},
    eTF.inputTileMode, 'Hex Columns');
  eTF.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Edit' }, eTF);
  eTF.tableSubmit.onclick = function() { LT.editTable(); };
}
LT.editTable = function () {
  var eTF = LT.editTablesForm;
  var cT = LT.currentTable;
  cT.name = eTF.inputTableName.value;
  cT.rows = eTF.inputTableRows.value;
  cT.columns = eTF.inputTableCols.value;
  cT.tile_height = eTF.inputTileHeight.value; 
  cT.tile_width = eTF.inputTileWidth.value;
  cT.tile_mode = eTF.inputTileMode.value;
  cT.wall_thickness = eTF.inputWallThickness.value;
  cT.grid_thickness = eTF.inputGridThickness.value;
  cT.update({});
  LT.loadTable();
}


populateCreateTableTab = function () {
  LT.tableListForm = LT.element('form', { }, LT.createTableTab);
  cTF = LT.tableListForm;
  var nameDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Name: ');
  cTF.inputTableName = LT.element('input', { size : 10, type: 'text',
    style : 'border: 1px solid #CCC;' }, nameDiv, 'Table Name', 1);
  var columnsDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Columns: ');
  cTF.inputTableCols = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, columnsDiv, '8', 1);
  var rowsDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Rows: ');
  cTF.inputTableRows = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, rowsDiv, '8', 1);
  var heightDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Tile Height: ');
  cTF.inputTileHeight = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, heightDiv, '45', 1);
  var widthDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Tile Width: ');
  cTF.inputTileWidth = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, widthDiv, '45', 1);
  var thicknessDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Grid Thickness: ');
  cTF.inputGridThickness = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, thicknessDiv, '1', 1);
  var wallThicknessDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Wall Thickness: ');
  cTF.inputWallThickness = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, wallThicknessDiv, '1', 1);
  var tileModeDiv = LT.element('div', { 'class' : 'inputDiv' }, cTF, 'Tile Mode: ');
  cTF.inputTileMode = LT.element('select', { size : 1, name : 'cTileMode', 
    style : 'border: 1px solid #CCC;' }, tileModeDiv);
  LT.element('option', { value : 'rectangle'}, cTF.inputTileMode, 'Rectangles');
  LT.element('option', { value : 'isometric'}, cTF.inputTileMode, 'Isometric');
  LT.element('option', { value : 'hex rows'}, cTF.inputTileMode, 'Hex rows');
  LT.element('option', { value : 'hex columns'}, cTF.inputTileMode, 'Hex Columns');
  cTF.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, cTF);
  cTF.tableSubmit.onclick = function() { LT.createTable(); };
  LT.tableRefresh = LT.element('input',{ type : 'button' }, LT.tablesPanel.footer, 'Refresh');
  LT.tableRefresh.onclick = function() { LT.refreshTables(); };
}

LT.createTable = function () {
  var cTF = LT.tableListForm;
  var createTableAjax = LT.ajaxRequest("POST", "php/create_table.php",
    {
	name : cTF.inputTableName.value,
	image_id : 1,
	default_tile: -1,
    rows : cTF.inputTableRows.value,
	columns : cTF.inputTableCols.value,
    tile_height : cTF.inputTileHeight.value, 
    tile_width : cTF.inputTileWidth.value,
    tile_mode : cTF.inputTileMode.value,
    wall_thickness : cTF.inputWallThickness.value,
    grid_thickness : cTF.inputGridThickness.value });
  LT.refreshTables();
}
