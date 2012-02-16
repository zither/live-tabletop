LT.load = function () {
  LT.tabletop = LT.element('div', {id: 'tabletop'}, document.body);

  LT.tileLayer = LT.element('div', {}, LT.tabletop);
  LT.wallLayer = LT.element('div', {}, LT.tabletop);
  LT.pieceLayer = LT.element('div', {}, LT.tabletop);
  LT.fogLayer = LT.element('div', {}, LT.tabletop);
  LT.clickLayers = LT.element('div', {}, LT.tabletop);
  LT.clickTileLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);
  LT.clickWallLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);
  LT.clickPieceLayer = LT.element('div', { 'class' : 'clickLayer' }, LT.clickLayers);

  LT.pageBar = LT.element('div', {id: 'pageBar'}, document.body);
  LT.element('div', {id: 'logo'}, LT.pageBar);
  LT.buttons = LT.element('div', {id: 'buttons'}, LT.pageBar);

  LT.tables = [];
/*
  LT.processImages;
  
  LT.Tile.readImages();
  LT.Piece.readImages();
  LT.Table.readImages();
*/

/*
  LT.createTablesPanel();
  LT.createPiecesPanel();
  LT.createChatPanel();
  LT.createTurnsPanel();
  LT.createFilesPanel();
*/
  LT.loginCheck();
/*
  LT.Table.loadPresets();
  LT.refreshMessageList();
  LT.loadTable();
  LT.holdTimestamps = 0;
  setInterval(LT.checkTimestamps, 2000);
*/
}

onload = function () {
  //var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
  var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
  if (checkInstall.status == 200) {
    LT.isInstalled = "1";
    LT.load();
  } else {
    LT.installer();
  }
};
