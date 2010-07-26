function emptyMe (clearMe, defaultText){
	if( clearMe.value == defaultText ){ clearMe.value = ""; }
	
}
function loadPage() {
  LT.tableTop = new LT.element('div', { id : 'tableTop' }, document.body);
  LT.pageBar = LT.element('div', { id : 'pageBar' }, document.body);
    var logoDiv = LT.element('div', { id : 'logo' }, LT.pageBar);
	LT.buttonsDiv = new LT.element('div', { id : 'buttons' }, LT.pageBar);

    var loginButton = new LT.element('div', { class : 'login'}, LT.pageBar);
	loginText = document.createTextNode("Login");
	logoutText = document.createTextNode("Logout");
    loginButton.appendChild(loginText);
    var loginDiv = new LT.element('div', { id : 'loginDiv' }, LT.pageBar);
    loginButton.onclick = function(){
      LT.pageBar.removeChild(loginButton);
      loginDiv.style.visibility = 'visible';
    }
      var loginForm = new LT.element('form', { id : 'loginForm', 
	    style : 'float: right;'}, loginDiv);
      var loginUsername = new LT.element('input', { style : 'border: 1px solid #CCC;',
        id : 'username', size : 10, value : 'username' }, loginForm);
	  loginUsername.onfocus = function(){ emptyMe(this, 'username') };
      var loginPassword = new LT.element('input', { style : 'border: 1px solid #CCC;',
        id : 'password', size : 10, value : 'password', type : 'password' }, loginForm);
	  loginPassword.onfocus = function(){ emptyMe(this, 'password') };
      var loginSubmit = new LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'loginSubmit', size : 8, value : 'Login' }, loginForm);
      loginSubmit.onclick = function(){
        var loginRoutine = LT.ajaxRequest("POST", "php/login.php",
          { username : loginUsername.value, password : loginPassword.value});
		//alert(loginRoutine.responseText);
		var userElement = loginRoutine.responseXML.getElementsByTagName('user')[0];
		if(userElement){
		  LT.username = userElement.getAttribute('name');
		  LT.userID = userElement.getAttribute('id');
		  LT.userColor = userElement.getAttribute('color');
		  LT.userPermissions = userElement.getAttribute('permissions');
		  alert(LT.username);
		}else{
		  alert('Incorrect username or password.')
		}
		//alert(loginRoutine.users.user[0]);
	  }
  //This creates global variables.
  window.tablePanel = new Panel( 'Tables', 420, 170, 175, 300);
  window.chatPanel = new Panel( 'Chat', 220, 26, 355, 130);
  window.turnsPanel = new Panel( 'Turns', 6, 26, 175, 300);
  window.toolsPanel = new Panel( 'Tools', 585, 26, 175, 300);
  window.filesPanel = new Panel( 'Files', 775, 26, 175, 150);
  
}
//var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
if(checkInstall.status != 200){
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