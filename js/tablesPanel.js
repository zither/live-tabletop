LT.readTables = function(){
  var readTablesAjax = LT.ajaxRequest("POST", "php/read_tables.php",{ });
  if (readTablesAjax.responseXML){
    var tableElements = readTablesAjax.responseXML.getElementsByTagName('table');
    LT.tables = [];
    for( var i = 0 ; i < tableElements.length; i++ ){
      var table = new LT.Table(tableElements[i]);
      LT.tables.push(table);
    }
  }
}

LT.readImages = function(){
  var readImages = LT.ajaxRequest("POST", "php/read_images.php",{ 'type' : 'tile'});
  if (readImages.responseXML){
    var imageElements = readImages.responseXML.getElementsByTagName('image');
    LT.images = {};
    for( var i = 0 ; i < imageElements.length; i++ ){
      var image = new LT.Image(imageElements[i]);
	  LT.images[image.id] = image;
    }
  }
}

LT.readTiles = function(){
  var readTiles = LT.ajaxRequest("POST", "php/read_tiles.php",{ 'table_id' : LT.currentTable.id });
  if (readTiles.responseXML){
    while(LT.tableTop.firstChild){
      LT.tableTop.removeChild(LT.tableTop.firstChild);
    }
    LT.tableTop.setAttribute('style', 'width: ' + LT.currentTable.tile_width * 
      LT.currentTable.tile_columns + 'px; height: ' + LT.currentTable.tile_height *
      LT.currentTable.tile_rows + 'px;');
    LT.tiles = [];
    var tileElements = readTiles.responseXML.getElementsByTagName('tiles');

	var tileText = decodeURIComponent(tileElements[0].textContent);
	var tilesArray = new Array();
    tilesArray = tileText.split(' ');
		
    for( var i = 0; i < LT.currentTable.tile_rows; i++){
      rowArray = []
      rowArray[i] = LT.element('div', {'style' : 'float : left; clear : both;'}, LT.tableTop);
      for( var n = 0; n < LT.currentTable.tile_columns; n++){
	    var tileNumber = (i * LT.currentTable.tile_columns) + n;
        var tile = new LT.Tile(LT.currentTable.id, n, i, tilesArray[tileNumber + 2]);
        LT.tiles.push(tile);
		var tileImage = '';
		/*
		for( var u = 0; u < LT.images.length; u++){
		  if (LT.images[u].id == LT.tiles[tileNumber].image_id){
		    tileImage = LT.images[u].file;
		  }
		}
		*/
		tileImage = LT.images[LT.tiles[tileNumber].image_id].file;
        tileDiv = LT.element('div', {'style': 'float: left; width: ' + LT.currentTable.tile_width + 
          'px; height: ' + LT.currentTable.tile_height + 'px; ' +
		  ' background: url(images/upload/tile/' + tileImage + ');'},
          rowArray[i]);
		tileDiv.id = tileNumber;
		tileDiv.onclick = function (){
		  this.style.backgroundImage = 'url(\'images/upload/tile/' + LT.selectedImage + '\')';
		  LT.tiles[this.id].update({image_id : LT.selectedImageID});
		  //alert(LT.tiles[this.id].x + ', ' + LT.tiles[this.id].y + ', table: ' +LT.tiles[this.id].table_id);
		}
      }
    }
  }
}

LT.loadTable = function (tableID) {
  for( i=0; i<LT.tables.length; i++ ){
    if(LT.tables[i].id == tableID){
	  LT.currentTable = LT.tables[i];
	}
  }
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
  document.cookie = 'table=' + LT.currentTable.id + ';';
}

LT.refreshTables = function () {
  LT.readTables();
  LT.readImages();
    while(LT.tablesDiv.firstChild){
      LT.tablesDiv.removeChild(LT.tablesDiv.firstChild);
    }
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
  LT.tablesPanel.tabs = new LT.Tabs(LT.tablesPanel, ['Tables', 'Create']);
  LT.createTableTab = LT.tablesPanel.tabs.tab[1].content;
  LT.tablesTab = LT.tablesPanel.tabs.tab[0].content;
  LT.tablesDiv = LT.element('div',{}, LT.tablesTab);
  LT.refreshTables();  
  LT.tablesForm = LT.element('form', { }, LT.createTableTab);
  var nameDiv = LT.element('div', { style : 'color: #000; width: 200px; float: left'
    }, LT.tablesForm, 'Name: ');
  LT.inputTableName = LT.element('input', { size : 10, type: 'text',
    style : 'border: 1px solid #CCC;' }, nameDiv, 'Table Name', 1);
  var columnsDiv = LT.element('div', { style : 'color: #000; width: 100px; float: left'
    }, LT.tablesForm, 'Columns: ');
  LT.inputTableCols = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, columnsDiv, 'Cols', 1);
  var rowsDiv = LT.element('div', { style : 'color: #000; width: 100px; float: left'
    }, LT.tablesForm, 'Rows: ');
  LT.inputTableRows = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, rowsDiv, 'Rows', 1);
  var heightDiv = LT.element('div', { style : 'color: #000; width: 100px; float: left'
    }, LT.tablesForm, 'Height: ');
  LT.inputTileHeight = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, heightDiv, 'Height', 1);
  var widthDiv = LT.element('div', { style : 'color: #000; width: 100px; float: left'
    }, LT.tablesForm, 'Width: ');
  LT.inputTileWidth = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, widthDiv, 'Width', 1);
  LT.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.tablesForm);
  LT.tableSubmit.onclick = function() { LT.createTable(); };
  LT.tableRefresh = LT.element('input',{ type : 'button' }, LT.tablesPanel.footer, 'Refresh');
  LT.tableRefresh.onclick = function() { LT.refreshTables(); };
};

LT.createTable = function () {
  var createTableAjax = LT.ajaxRequest("POST", "php/create_table.php",
    { name : LT.inputTableName.value, image_id : 1, default_tile: 1,
    rows : LT.inputTableRows.value, columns : LT.inputTableCols.value,
    tile_height : LT.inputTileHeight.value, tile_width : LT.inputTileWidth.value });
  LT.refreshTables();
}
