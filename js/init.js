//var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
if(checkInstall.status == 200){
  LT.isInstalled = "1";
}else{
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
function loadPage() {
  LT.pageBar = LT.element('div', { id : 'pageBar' }, document.body);
    var logoDiv = LT.element('div', { id : 'logo' }, LT.pageBar);
	LT.buttonsDiv = new LT.element('div', { id : 'buttons' }, LT.pageBar);
  LT.tableTop = new LT.element('div', { id : 'tableTop' }, document.body);
  loginCheck();
  //This creates global variables.
  LT.tablesPanel = new LT.Panel( 'Tables', 'Tables', LT.buttonsDiv, 6, 26, 175, 300);
  LT.chatPanel = new LT.Panel( 'Chat', 'Chat', LT.buttonsDiv, 6, 49, 355, 130);
  LT.turnsPanel = new LT.Panel( 'Turns', 'Turns', LT.buttonsDiv, 6, 72, 175, 300);
  LT.toolsPanel = new LT.Panel( 'Tools', 'Tools', LT.buttonsDiv, 6, 95, 225, 250);
  LT.filesPanel = new LT.Panel( 'Files', 'Files', LT.buttonsDiv, 6, 118, 250, 150);
  
  populateChatPanel();
  populateTablesPanel();
}
