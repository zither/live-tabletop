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
LT.loadTableHandler = function (table) {
  return function () { LT.loadTable(table); };
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
      LT.element('br', {}, LT.chatPanel.output);
      LT.element('div', {'class' : 'chat_alert'}, LT.chatPanel.output, 
        "Loading chat log for " + LT.currentTable.name + "...");
      LT.lastMessage = 0;
      LT.refreshMessageList();
      LT.element('a', {'class' : 'chat_alert'}, LT.chatPanel.output, 
        "Arriving at " + LT.currentTable.name);
      LT.element('br', {}, LT.chatPanel.output);
      LT.chatPanel.output.removeChild(LT.chatBottom);
      LT.chatPanel.output.appendChild(LT.chatBottom);
      LT.chatBottom.scrollIntoView(true);
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
      eTF.name.setAttribute('value', cT.name);
      eTF.cols.setAttribute('value', cT.tile_columns);
      eTF.rows.setAttribute('value', cT.tile_rows);
      eTF.tileHeight.setAttribute('value', cT.tile_height);
      eTF.tileWidth.setAttribute('value', cT.tile_width);
      eTF.gridThickness.setAttribute('value', cT.grid_thickness);
      eTF.wallThickness.setAttribute('value', cT.wall_thickness);
      for ( i = 0; i < eTF.selectBG.length; i++) {
        if (eTF.selectBG[i].value == LT.currentTable.image_id) {
          eTF.selectBG[i].setAttribute('selected', 'select');
        }else{
          eTF.selectBG[i].removeAttribute('selected');
        }
      }
      eTF.rectangleMode.removeAttribute('selected');
      eTF.isometricMode.removeAttribute('selected');
      eTF.hexColumnsMode.removeAttribute('selected');
      eTF.hexRowsMode.removeAttribute('selected');
      if (cT.tile_mode == 'rectangle') {
        eTF.rectangleMode.setAttribute('selected', 'select');
      }
      if (cT.tile_mode == 'isometric') {
        eTF.isometricMode.setAttribute('selected', 'select');
      }
      if (cT.tile_mode == 'hex columns') {
        eTF.hexColumnsMode.setAttribute('selected', 'select');
      }
      if (cT.tile_mode == 'hex rows') {
        eTF.hexRowsMode.setAttribute('selected', 'select');
      }
    }
 
}
LT.refreshTables = function () {
  LT.Table.readTables();
  LT.fill(LT.tablesDiv);
  for( var i = 0 ; i < LT.tables.length; i++ ){    
    tableEntry = LT.element('div', { 'style' : 'clear: both;' }, LT.tablesDiv, ' ')
    var tableLink = LT.element('a', {'class' : 'textButton'}, tableEntry, LT.tables[i].name);
    tableLink.onclick = LT.loadTableHandler(LT.tables[i]);
    tableDelete = LT.element('a', { 'class' : 'deleteButton' }, tableEntry, 'Delete');
    tableDelete.onclick = LT.Table.deleteTable(LT.tables[i]);
    LT.element('div',{'class' : 'separator'}, tableEntry);
  }
}
LT.Table.deleteTable = function (table) {
  return function () {
    var confirmDel =  confirm('Are you sure you want to delete '
      + table.name + '?');
    if (confirmDel) {
      LT.ajaxRequest("POST", "php/delete_table.php",{ 'table_id' : table.id });
      LT.refreshTables();
    }
  }
}

LT.createTablesPanel = function () {
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', 6, 26, 140, 180);
  LT.tablesPanel.makeTab('List');
  LT.tablesTab = LT.tablesPanel.tabs[0].content;
  LT.tablesPanel.makeTab('Create');
  LT.createTableTab = LT.tablesPanel.tabs[1].content;
  LT.tablesPanel.makeTab('Settings');
  LT.editTableTab = LT.tablesPanel.tabs[2].content;
  LT.tablesPanel.makeTab('Tools', function () {
    LT.bringForward(LT.clickPieceLayer);
    LT.brush = "piece";
  });
  LT.toolsTab = LT.tablesPanel.tabs[3];
  LT.tableRefresh = LT.element('input',{ type : 'button' }, LT.tablesTab, 'Refresh');
  LT.tableRefresh.onclick = function() { LT.refreshTables(); };
  LT.tablesDiv = LT.element('div',{}, LT.tablesTab);
  LT.refreshTables();  
  populateCreateTableTab();
  populateEditTableTab();

};

populateEditTableTab = function () {
  var form = LT.element('form', { }, LT.editTableTab);
  LT.Table.editForm = {
    name: LT.element('input', { size:10, type:'text' }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Name: ') ),
    background: LT.element('select', { 'style':'width: 135px;', name:'tableBG' }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Background: ') ),
    cols: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Columns: ') ),
    rows: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Rows: ') ),
    tileHeight: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Tile Height: ') ),
    tileWidth: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Tile Width: ') ),
    gridThickness: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Grid Thickness: '), '1', 1),
    wallThickness: LT.element('input', { size:1 }, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Wall Thickness: '), '1', 1),
    tileMode: LT.element('select', { size:1, name:'eTileMode'}, 
      LT.element('div', { 'class':'inputDiv' }, form, 'Tile Mode: ') ),
    submit: LT.element('input', { type:'button', style:'cursor: pointer', 
      id:'chatSubmit', size:8, value:'Apply Changes' }, form)
  }
  eTF = LT.Table.editForm;
  eTF.submit.onclick = function() { LT.Table.edit(); };
  eTF.rectangleMode = LT.element('option', { value : 'rectangle'}, eTF.tileMode, 'Rectangles');
  eTF.isometricMode = LT.element('option', { value : 'isometric'}, eTF.tileMode, 'Isometric');
  eTF.hexRowsMode = LT.element('option', { value : 'hex rows'}, eTF.tileMode, 'Hex rows');
  eTF.hexColumnsMode = LT.element('option', { value : 'hex columns'}, eTF.tileMode, 'Hex Columns');
  LT.element('option', { value : 0}, eTF.background, 'None');
  eTF.selectBG = []
  for ( i = 0; i < LT.Table.images.length; i++) {
    var image = LT.Table.images[i];
    var imageName = image.file.substr(0, image.file.length - 4);
    eTF.selectBG[i] = LT.element('option', { value : image.id},
      eTF.background, imageName);
  }
}
LT.Table.edit = function () {
  var eTF = LT.Table.editForm;
  var cT = LT.currentTable;
  cT.name = eTF.name.value;
  cT.image_id = eTF.background.value;
  cT.rows = eTF.rows.value;
  cT.columns = eTF.cols.value;
  cT.tile_height = eTF.tileHeight.value; 
  cT.tile_width = eTF.tileWidth.value;
  cT.tile_mode = eTF.tileMode.value;
  cT.wall_thickness = eTF.wallThickness.value;
  cT.grid_thickness = eTF.gridThickness.value;
  cT.update({});
  LT.loadTable();
}

populateCreateTableTab = function () {
  form = LT.element('form', { }, LT.createTableTab);
  LT.Table.createForm = {
    name: LT.element('input', { size:10, type:'text'}, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Name: '), 'Table Name', 1),
    background: LT.element('select', { 'style':'width: 135px;', name:'tableBG' }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Background: ') ),
    cols: LT.element('input', { size:1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Columns: '), '8', 1),
    rows: LT.element('input', { size:1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Rows: '), '8', 1),
    tileHeight: LT.element('input', { size:1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Tile Height: '), '45', 1),
    tileWidth: LT.element('input', { size:1 },
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Tile Width: '), '45', 1),
    gridThickness: LT.element('input', { size:1 }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Grid Thickness: '), '1', 1),
    wallThickness: LT.element('input', { size:1 }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Wall Thickness: '), '1', 1),
    tileMode: LT.element('select', { name:'cTileMode' }, 
      LT.element('div', { 'class' : 'inputDiv' }, form, 'Tile Mode: ') ),
    submit: LT.element('input', { type : 'button', style : 'cursor: pointer', 
      id : 'chatSubmit', size : 8, value : 'Create' }, form)
  }
  cTF = LT.Table.createForm
  LT.element('option', { value : 'rectangle'}, cTF.tileMode, 'Rectangles');
  LT.element('option', { value : 'isometric'}, cTF.tileMode, 'Isometric');
  LT.element('option', { value : 'hex rows'}, cTF.tileMode, 'Hex rows');
  LT.element('option', { value : 'hex columns'}, cTF.tileMode, 'Hex Columns');
  cTF.submit.onclick = LT.createTableHandler();
  LT.element('option', { value : 0}, cTF.background, 'None');
  for ( i = 0; i < LT.Table.images.length; i++) {
    var image = LT.Table.images[i];
    var imageName = image.file.substr(0, image.file.length - 4);
    LT.element('option', { value : image.id}, cTF.background, imageName);
  }
}

LT.createTableHandler = function () {
  return function () {
    LT.Table.create();
    for( var i = 0 ; i < LT.tables.length; i++ ){
      if (LT.tables[i].name == LT.Table.createForm.name.value) {
         LT.currentTable = LT.tables[i];
      }
    }
    LT.loadTable();
  };
}
LT.Table.create = function () {
  var cTF = LT.Table.createForm;
  var createTableAjax = LT.ajaxRequest("POST", "php/create_table.php",
    {
    name : cTF.name.value,
    image_id : cTF.background.value,
    default_tile: -1,
    rows : cTF.rows.value,
    columns : cTF.cols.value,
    tile_height : cTF.tileHeight.value, 
    tile_width : cTF.tileWidth.value,
    tile_mode : cTF.tileMode.value,
    wall_thickness : cTF.wallThickness.value,
    grid_thickness : cTF.gridThickness.value });
  LT.refreshTables();
}
