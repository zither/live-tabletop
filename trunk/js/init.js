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
function emptyMe (clearMe, defaultText){
	if( clearMe.value == defaultText ){ clearMe.value = ""; }	
}
function loadPage() {
  LT.tableTop = new LT.element('div', { id : 'tableTop' }, document.body);
  LT.pageBar = LT.element('div', { id : 'pageBar' }, document.body);
    var logoDiv = LT.element('div', { id : 'logo' }, LT.pageBar);
	LT.buttonsDiv = new LT.element('div', { id : 'buttons' }, LT.pageBar);
  LT.createLogin();
  //This creates global variables.
  LT.tablePanel = new Panel( 'Tables', 'Tables', LT.buttonsDiv, 420, 170, 175, 300);
  LT.chatPanel = new Panel( 'Chat', 'Chat', LT.buttonsDiv, 220, 26, 355, 130);
  LT.turnsPanel = new Panel( 'Turns', 'Turns', LT.buttonsDiv, 6, 26, 175, 300);
  LT.toolsPanel = new Panel( 'Tools', 'Tools', LT.buttonsDiv, 585, 26, 175, 300);
  LT.filesPanel = new Panel( 'Files', 'Files', LT.buttonsDiv, 775, 26, 175, 150);
  
}
