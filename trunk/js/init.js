LT.load = function () {
  LT.clickTileLayer = LT.createElement({'class': 'clickLayer'});
  LT.clickWallLayer = LT.createElement({'class': 'clickLayer'});
  LT.clickPieceLayer = LT.createElement({'class': 'clickLayer'});
  LT.clickLayers = LT.createElement([LT.clickTileLayer, LT.clickWallLayer, LT.clickPieceLayer]);
  LT.tileLayer = LT.createElement();
  LT.wallLayer = LT.createElement();
  LT.pieceLayer = LT.createElement();
  LT.fogLayer = LT.createElement();
  LT.tabletop = LT.createElement(document.body, {id: 'tabletop'},
    [LT.tileLayer, LT.wallLayer, LT.pieceLayer, LT.fogLayer, LT.clickLayers]);

  LT.buttons = LT.createElement({id: 'buttons'});
  LT.pageBar = LT.createElement(document.body, {id: 'pageBar'}, [[{id: 'logo'}], LT.buttons]);

  LT.tables = [];

  LT.loginCheck();
};

onload = function () {
  var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
  if (checkInstall.status == 200) {
    LT.isInstalled = "1";
    LT.load();
  } else {
    LT.installer();
  }
};

