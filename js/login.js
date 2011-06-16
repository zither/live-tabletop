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
  //loginUsername.onfocus = function(){ emptyMe(this, 'username') };
  LT.loginPassword = LT.element('input', { style : 'border: 1px solid #CCC;',
    id : 'password', size : 10, type : 'password' }, LT.loginForm, 'password', 1);
  var loginSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'loginSubmit', size : 8 }, LT.loginForm, 'Login');
  loginSubmit.onclick = function () {LT.sendLogin(LT.loginUsername.value, LT.loginPassword.value)};
};

LT.createUserPanel = function () {
  LT.userButton = LT.element('div', { id : 'loginDiv' });
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 210, 100, LT.userButton);
  LT.element('a', {id: 'logoutDiv'}, LT.userPanel.content, 'Logout')
    .onclick = LT.logout;
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  createImagesButton = LT.element('a', {}, LT.userPanel.content, 'Process Uploaded Images');
  createImagesButton.onclick = function(){
    LT.ajaxRequest("POST", "php/create_images.php", {});
    //LT.ajaxRequest("POST", "php/create_images.php", {});
    //LT.ajaxRequest("POST", "php/create_images.php", {});
  }
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  defaultPanels = LT.element('a', {}, LT.userPanel.content, 'Default Panels');
  defaultPanels.onclick = function(){
    LT.tablesPanel.refreshPanel();
    LT.chatPanel.refreshPanel();
    LT.turnsPanel.refreshPanel();
    LT.toolsPanel.refreshPanel();
    LT.filesPanel.refreshPanel();
    LT.userPanel.refreshPanel();
  }
 /*
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  savePanelsButton = LT.element('a',{ }, LT.userPanel.content, 'Save Panels');
  savePanelsButton.onclick = function() {
    LT.savePanels();
  };
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  loadPanelsButton = LT.element('a',{ }, LT.userPanel.content, 'Load Panels');
  loadPanelsButton.onclick = function() {
    LT.loadPanels();
  };
  */
  LT.userForm = LT.element('form', { }, LT.userPanel.footer);
  LT.inputUserName = LT.element('input', { size : 8, type: 'text',
    style : 'border: 0px solid #CCC;' }, LT.userForm, 'User Name', 1);
  
  LT.inputPassword = LT.element('input', { size : 8, 
    style : 'border: 1px solid #CCC;' }, LT.userForm, 'Password', 1);
  
  userSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Create' }, LT.userForm);
  userSubmit.onclick = function() { LT.createUser(); };
  userRefresh = LT.element('input',{ type : 'button' }, LT.userPanel.footer, 'Refresh');
  userRefresh.onclick = function() { LT.refreshTables(); };
}

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
	LT.loadPanels();
	LT.loadPieceImages();
  } else {
    alert('Incorrect username or password.');
  }
}
LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.toggleVisibility();
  LT.pageBar.removeChild(LT.userButton);
  LT.pageBar.appendChild(LT.loginForm);
  LT.element('div', {'class' : 'chat_alert'}, LT.chatOutput, "You have logged out.");
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
}
