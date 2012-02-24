LT.load = function () {
  LT.clickTileLayer = LT.element({'class': 'clickLayer'});
  LT.clickWallLayer = LT.element({'class': 'clickLayer'});
  LT.clickPieceLayer = LT.element({'class': 'clickLayer'});
  LT.clickLayers = LT.element([LT.clickTileLayer, LT.clickWallLayer, LT.clickPieceLayer]);
  LT.tileLayer = LT.element();
  LT.wallLayer = LT.element();
  LT.pieceLayer = LT.element();
  LT.fogLayer = LT.element();
  LT.tabletop = LT.element(document.body, {id: 'tabletop'},
    [LT.tileLayer, LT.wallLayer, LT.pieceLayer, LT.fogLayer, LT.clickLayers]);

  LT.buttons = LT.element({id: 'buttons'});
  LT.pageBar = LT.element(document.body, {id: 'pageBar'}, [[{id: 'logo'}], LT.buttons]);

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

