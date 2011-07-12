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
  LT.createToolsPanel();
  LT.createChatPanel();
  LT.createTurnsPanel();
  LT.createFilesPanel();
  LT.loginCheck();
  LT.Table.loadPresets();
  LT.refreshMessageList();
  LT.loadTable();
  LT.holdTimestamps = 0;
  setInterval(LT.checkTimestamps, 2000);
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
