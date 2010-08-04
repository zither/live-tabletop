function refreshTableList(){
  var readTables = LT.ajaxRequest("POST", "php/read_tables.php",{ });
  if (readTables.responseXML){
  var tableElements = readTables.responseXML.getElementsByTagName('table');
  LT.tableList = [];
  for( var i = 0 ; i < tableElements.length; i++ ){
    var table = {
	  name : tableElements[i].getAttribute('name'),
	  imageID : tableElements[i].getAttribute('image_id')
    };
  LT.tableList.push(table);
  }
  //alert(LT.tableList.length);
  for( var i = 0 ; i < LT.tableList.length; i++ ){
    LT.element('div', {}, LT.tableListDiv, LT.tableList[i].name);
  }
  }
}

function populateTablesPanel() {
  //refreshTableList();
  LT.tableListDiv = LT.element('div',{}, LT.tablesPanel.content);
  LT.tableRefresh = LT.element('a',{}, LT.tablesPanel.content, 'Refresh');
  LT.tableRefresh.onClick = refreshTableList();
  LT.tablesForm = LT.element('form', { }, LT.tablesPanel.content);
  LT.tableInput = LT.element('input', { size : 24, 
    style : 'border: 1px solid #CCC;', value : '<< Table Name >>' }, LT.tablesForm);
  LT.tableInput.onfocus = function(){ emptyMe(this, '<< Table Name >>') };
  LT.tableSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.tablesForm);

      LT.tableSubmit.onclick = function(){
        var createTable = LT.ajaxRequest("POST", "php/create_table.php",
          { name : LT.tableInput.value, image_id : 1, default_tile: 1,
		    rows : 1, columns : 1, tile_height : 1, tile_width : 1 });
      }
}
