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
        rows : tableElements[i].getAttribute('rows'),
        columns : tableElements[i].getAttribute('columns'),        
		tile_height : tableElements[i].getAttribute('tile_height'),
        tile_width : tableElements[i].getAttribute('tile_width')
      };
      LT.tableList.push(table);
    }
    for( var i = 0 ; i < LT.tableList.length; i++ ){
      tableLink = LT.element('a', {id: "dud"}, LT.tableListDiv, LT.tableList[i].name);
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
      };
      LT.element('br', {}, LT.tableListDiv);
    }
  }
};

LT.createTablesPanel = function () {
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', 6, 26, 300, 300);
  LT.tableListDiv = LT.element('div',{}, LT.tablesPanel.content);
  LT.tableRefresh = LT.element('a',{}, LT.tablesPanel.header, 'Refresh');
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
};

LT.createTable = function () {
  var createTableAjax = LT.ajaxRequest("POST", "php/create_table.php",
    { name : LT.inputTableName.value, image_id : 1, default_tile: 1,
    rows : LT.inputTableRows.value, columns : LT.inputTableCols.value,
    tile_height : LT.inputTileHeight.value, tile_width : LT.inputTileWidth.value });
  LT.refreshTableList();
}
