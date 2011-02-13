LT.loadTable = function (){
  for( var i = 0 ; i < LT.tableList.length; i++ ){
    if(LT.tableList[i].id == LT.tableID){
	  LT.tableColumns = LT.tableList[i].columns;
	  LT.tableRows = LT.tableList[i].rows;
	  LT.tileWidth = LT.tableList[i].tile_width;
	  LT.tileHeight = LT.tableList[i].tile_height;
	}
  }
}

LT.render = function()
{
var readTiles = LT.ajaxRequest("POST", "php/read_tiles.php",{ 'table_id' : LT.tableID });
  if (readTiles.responseXML){
    while(LT.tableTop.firstChild){
      LT.tableTop.removeChild(LT.tableTop.firstChild);
    }
	LT.tableTop.setAttribute('style', 'width: ' + LT.tileWidth * LT.tableColumns + 
		'px; height: ' + LT.tileHeight * LT.TableRows + 'px; border: 1px solid black;');
    var tableTiles = readTiles.responseXML.getElementsByTagName('tiles');
	var tileText = decodeURIComponent(tableTiles[0].textContent);
	var tilesArray = new Array();
    tilesArray = tileText.split(' ');
    for( var i = 2 ; i < tilesArray.length; i++ ){
        LT.element('div', {
		'style' : 'float: left; width: ' + LT.tileWidth + 
		'px; height: ' + LT.tileHeight + 'px;'
		}, LT.tableTop, tilesArray[i]);
	}
  }
}

LT.refreshTableList = function () {
  var readTables = LT.ajaxRequest("POST", "php/read_tables.php",{ });
  if (readTables.responseXML){
    while(LT.tableListDiv.firstChild){
      LT.tableListDiv.removeChild(LT.tableListDiv.firstChild);
    }
    var tableElements = readTables.responseXML.getElementsByTagName('table');
    LT.tableList = [];
    for( var i = 0 ; i < tableElements.length; i++ ){
      var table = {
        name : decodeURIComponent(tableElements[i].getAttribute('name')),
        id : decodeURIComponent(tableElements[i].getAttribute('id')),
        imageID : tableElements[i].getAttribute('image_id'),
        rows : tableElements[i].getAttribute('tile_rows'),
        columns : tableElements[i].getAttribute('tile_columns'),        
		tile_height : tableElements[i].getAttribute('tile_height'),
        tile_width : tableElements[i].getAttribute('tile_width')
      };
      LT.tableList.push(table);
    }
	var altSwitch = 0;
    for( var i = 0 ; i < LT.tableList.length; i++ ){
	  var altClass = '';
	  if(altSwitch){
        altClass = 'altList'; altSwitch = 0;
	  }
	  else{
        altSwitch = 1;
	  }
      tableLink = LT.element('div', { 'class' : altClass }, LT.tableListDiv, LT.tableList[i].name);
	  tableLink.name = LT.tableList[i].name;
	  tableLink.id = LT.tableList[i].id;
	  tableLink.onclick = function(){
		LT.tableID = this.id;
	    LT.element('br', {}, LT.chatOutput);
	    LT.element('div', {}, LT.chatOutput, 
		  "Loading chat log for " + this.name + "...");
		LT.lastMessage = 0;
		LT.refreshMessageList();
	    LT.element('a', {style : "height: 32px; color: 33C;"}, LT.chatOutput, 
		  "Arriving at " + this.name);
        LT.element('br', {}, LT.chatOutput);
        LT.chatOutput.removeChild(LT.chatBottom);
        LT.chatOutput.appendChild(LT.chatBottom);
        LT.chatBottom.scrollIntoView(true);
		LT.loadTable();
        LT.render();
      };
    }
  }
};

LT.createTablesPanel = function () {
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', 6, 26, 300, 300);
  LT.tableListDiv = LT.element('div',{}, LT.tablesPanel.content);
  LT.refreshTableList();
  LT.tablesForm = LT.element('form', { }, LT.tablesPanel.footer);
  LT.inputTableName = LT.element('input', { size : 12, type: 'text',
    style : 'border: 0px solid #CCC;' }, LT.tablesForm, 'Table Name', 1);
  LT.inputTableCols = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, LT.tablesForm, 'Cols', 1);
  LT.inputTableRows = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, LT.tablesForm, 'Rows', 1);
  LT.inputTileHeight = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, LT.tablesForm, 'Height', 1);
  LT.inputTileWidth = LT.element('input', { size : 1, 
    style : 'border: 1px solid #CCC;' }, LT.tablesForm, 'Width', 1);
  LT.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.tablesForm);
  LT.tableSubmit.onclick = function() { LT.createTable(); };
  LT.tableRefresh = LT.element('input',{ type : 'button' }, LT.tablesPanel.footer, 'Refresh');
  LT.tableRefresh.onclick = function() { LT.refreshTableList(); };
};

LT.createTable = function () {
  var createTableAjax = LT.ajaxRequest("POST", "php/create_table.php",
    { name : LT.inputTableName.value, image_id : 1, default_tile: 1,
    rows : LT.inputTableRows.value, columns : LT.inputTableCols.value,
    tile_height : LT.inputTileHeight.value, tile_width : LT.inputTileWidth.value });
  LT.refreshTableList();
}
