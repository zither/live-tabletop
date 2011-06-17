LT.loginCheck = function () {
  LT.createLogin();
  LT.createUserPanel();
  var checkLogin = LT.ajaxRequest("POST", "php/login_check.php",{ });
  if (checkLogin.responseXML) {
    LT.login(checkLogin);
    LT.pageBar.appendChild(LT.userButton);
  } else {
    LT.pageBar.appendChild(LT.loginForm);
  }
};

LT.createLogin = function () {
  LT.loginForm = LT.element('form', { id : 'loginForm', 
    style : 'float: right;'}, LT.pageBar);
  LT.loginUsername = LT.element('input', { style : 'border: 1px solid #CCC;',
    id : 'username', size : 10 }, LT.loginForm, 'username', 1);
  LT.loginPassword = LT.element('input', { style : 'border: 1px solid #CCC;',
    id : 'password', size : 10, type : 'password' }, LT.loginForm, 'password', 1);
  var loginSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'loginSubmit', size : 8 }, LT.loginForm, 'Login');
  loginSubmit.onclick = function () {LT.sendLogin(LT.loginUsername.value, LT.loginPassword.value)};
};

LT.createUser = function () {
  var createUserAjax = LT.ajaxRequest("POST", "php/create_user.php",
    { username : LT.inputUserName.value, permissions : 'user', 
	 password : LT.inputPassword.value});
}

LT.sendLogin = function (loginName, loginPW) {
  var loginAjax = LT.ajaxRequest("POST", "php/login.php",
    { username : loginName, password : loginPW});
  LT.login(loginAjax);
}
LT.login = function (loginAjax) {
  var userElement = loginAjax.responseXML.getElementsByTagName('user')[0];
  LT.currentUser = new LT.User(userElement);
  var readUsers = LT.ajaxRequest("POST", "php/read_users.php",{});
  if (readUsers.responseXML){
    var userElements = readUsers.responseXML.getElementsByTagName('user');
    LT.users = [];
    for( var i = 0 ; i < userElements.length; i++ ){
      var user = new LT.User(userElements[i]);
      LT.users.push(user);
    }
  }
  if (LT.currentUser.id) {
    LT.pageBar.removeChild(LT.loginForm);
    LT.element('div', {id: 'loggedIn'}, LT.userButton);
    var newUsername = document.createTextNode(LT.currentUser.name + "'s options");
	LT.userPanel.buttonCaption.removeChild(LT.userPanel.buttonCaption.firstChild);
	LT.userPanel.buttonCaption.appendChild(newUsername);
    LT.pageBar.appendChild(LT.userButton);
    if (LT.tableListDiv){ LT.refreshTableList(); }
	LT.element('div', {'class' : 'chat_alert'}, LT.chatOutput, "You are logged in.");
    LT.chatOutput.removeChild(LT.chatBottom);
    LT.chatOutput.appendChild(LT.chatBottom);
    LT.chatBottom.scrollIntoView(true);
	LT.refreshTables();
	LT.loadSwatches();
	LT.Panel.loadCookie();
	LT.loadPieceImages();
  } else {
    alert('Incorrect username or password.');
  }
}
LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.hide();
  LT.pageBar.removeChild(LT.userButton);
  LT.pageBar.appendChild(LT.loginForm);
  LT.element('div', {'class' : 'chat_alert'}, LT.chatOutput, "You have logged out.");
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
}
