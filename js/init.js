LT.loadLT = function () {
  LT.tableTop = LT.element('div', {id: 'tableTop'}, document.body);
  LT.tileLayer = LT.element('div', {}, LT.tableTop);
  LT.wallLayer = LT.element('div', {}, LT.tableTop);
  LT.pieceLayer = LT.element('div', {}, LT.tableTop);
  LT.fogLayer = LT.element('div', {}, LT.tableTop);
  LT.clickTileLayer = LT.element('div', {}, LT.tableTop);
  LT.clickWallLayer = LT.element('div', {style: 'display: none'}, LT.tableTop);
  LT.clickPieceLayer = LT.element('div', {}, LT.tableTop);
  LT.clickFogLayer = LT.element('div', {}, LT.tableTop);
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
  var tableCookie = parseInt(getCookie('table'));
  LT.loadTable(tableCookie);
  LT.pForm.wInput.setAttribute('value', LT.currentTable.tile_width);
  LT.pForm.hInput.setAttribute('value', LT.currentTable.tile_height);
}

refreshTimestamps = function () {
  
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