function emptyMe (clearMe, defaultText){
	if( clearMe.value == defaultText ){ clearMe.value = ""; }
	
}
function loadPage() {
  tableTop = document.createElement('div');
  tableTop.setAttribute('id', 'tableTop');
  document.body.appendChild(tableTop);
  //var tableTop = new element('div', { id : 'tableTop' }, document.body);
  var pageBar = element('div', { id : 'pageBar' }, document.body);
    var logoDiv = element('div', { id : 'logo' }, pageBar);
	//var buttonsDiv = new element('div', { id : 'buttons' }, pageBar););
    buttonsDiv = document.createElement('div');
    buttonsDiv.setAttribute('id', 'buttons');
    pageBar.appendChild(buttonsDiv);
    var loginButton = new element('div', { class : 'login'}, pageBar);
	loginText = document.createTextNode("Login");
	logoutText = document.createTextNode("Logout");
    loginButton.appendChild(loginText);
    var loginDiv = new element('div', { id : 'loginDiv' }, pageBar);
    loginButton.onclick = function(){
      pageBar.removeChild(loginButton);
      loginDiv.style.visibility = 'visible';
    }
      var loginForm = new element('form', { id : 'loginForm', 
	    style : 'float: right;'}, loginDiv);
      var loginUsername = new element('input', { style : 'border: 1px solid #CCC;',
        id : 'username', size : 10, value : 'username' }, loginForm);
	  loginUsername.onfocus = function(){ emptyMe(this, 'username') };
      var loginPassword = new element('input', { style : 'border: 1px solid #CCC;',
        id : 'password', size : 10, value : 'password', type : 'password' }, loginForm);
	  loginPassword.onfocus = function(){ emptyMe(this, 'password') };
      var loginSubmit = new element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'loginSubmit', size : 8, value : 'Login' }, loginForm);
      loginSubmit.onclick = function(){
        var loginRoutine = LT_ajax_request("POST", "php/login.php",
          { username : loginUsername.value, password : loginPassword.value});
		alert(loginRoutine.responseText);
		//alert(loginRoutine.users.user[0]);
	  }
  //This creates global variables.
  window.tablePanel = new Panel( 'Tables', 420, 170, 175, 300);
  window.chatPanel = new Panel( 'Chat', 220, 26, 355, 130);
  window.turnsPanel = new Panel( 'Turns', 6, 26, 175, 300);
  window.toolsPanel = new Panel( 'Tools', 585, 26, 175, 300);
  window.filesPanel = new Panel( 'Files', 775, 26, 175, 150);
  
}
//var checkInstall = LT_ajax_request("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
var checkInstall = LT_ajax_request("POST", 'php/db_config.php', {});
if(checkInstall.status != 200){
  var installRoutine = LT_ajax_request("POST", "php/install.php",
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