LT.loadLT = function () {
  LT.tableTop = LT.element('div', {id: 'tableTop'}, document.body);
  LT.tileLayer = LT.element('div', {}, LT.tableTop);
  LT.wallLayer = LT.element('div', {}, LT.tableTop);
  LT.pieceLayer = LT.element('div', {}, LT.tableTop);
  LT.fogLayer = LT.element('div', {}, LT.tableTop);
  LT.clickLayers = LT.element('div', {}, LT.tableTop);
  LT.clickTileLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);
  LT.clickWallLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);
  LT.clickPieceLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);
  LT.pageBar = LT.element('div', {id: 'pageBar'}, document.body);
  LT.element('div', {id: 'logo'}, LT.pageBar);
  LT.buttons = LT.element('div', {id: 'buttons'}, LT.pageBar);
  LT.tables = [];
  LT.createTablesPanel();
  LT.createChatPanel();
  LT.createTurnsPanel();
  LT.createToolsPanel();
  LT.createFilesPanel();
  LT.loginCheck();
  LT.refreshMessageList();
  LT.loadTable();
  setInterval('LT.checkTimestamps()', 2000);
}
LT.checkTimestamps = function () {
  if (LT.currentTable) {
    cT = LT.currentTable
    var args = {table_id: LT.currentTable.id};
    LT.ajaxRequest("POST", "php/read_table.php", args, function (ajax) {
      var tableResponse = ajax.responseXML.getElementsByTagName("table");
      var table = new LT.Table(tableResponse[0]);
	  if (cT.piece_stamp < table.piece_stamp) {
	    cT.piece_stamp = table.piece_stamp;
		LT.loadPieces();
	  }
    });
  }
}

onload = function () {
  //var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
  var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
  if (checkInstall.status == 200) {
    LT.isInstalled = "1";
    LT.loadLT();
  } else {
    LT.installer();
  }
};
