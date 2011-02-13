LT.loadLT = function () {
  LT.pageBar = LT.element('div', {id: 'pageBar'}, document.body);
  LT.element('div', {id: 'logo'}, LT.pageBar);
  LT.buttons = LT.element('div', {id: 'buttons'}, LT.pageBar);
  LT.tableTop = LT.element('div', {id: 'tableTop'}, document.body);
  LT.loginCheck();
  LT.createTablesPanel();
  LT.createChatPanel();
  LT.createTurnsPanel();
  LT.createToolsPanel();
  LT.createFilesPanel();
  LT.loadTiles();
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
    var installRoutine = LT.ajaxRequest("POST", "php/install.php",
      {
        location: "localhost",
        username: "root",
        password: "password",
        database: "livetabletop01",
        admin_username: "admin",
        admin_password: "password"
      }
    );
  }
};

