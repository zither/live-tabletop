LT.loginCheck = function () {
  LT.createLogin();
  LT.createUserPanel();
  var checkLogin = LT.ajaxRequest("POST", "php/login_check.php",{ });
  if (checkLogin.responseXML) {
    LT.loginAjax = checkLogin;
    LT.login();
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
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 150, 150, LT.userButton);
  LT.element('a', {id: 'logoutDiv'}, LT.userPanel.content, 'Logout')
    .onclick = LT.logout;
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  createImagesButton = LT.element('a', {}, LT.userPanel.content, 'Process Uploaded Images');
  createImagesButton.onclick = function(){
    LT.ajaxRequest("POST", "php/create_images.php", {});
  }
  
  LT.element('div', {'class': 'separator'}, LT.userPanel.content);
  
  refreshPanels = LT.element('a', {}, LT.userPanel.content, 'Refresh Panels');
  refreshPanels.onclick = function(){
    LT.tablesPanel.refreshPanel();
    LT.chatPanel.refreshPanel();
    LT.turnsPanel.refreshPanel();
    LT.toolsPanel.refreshPanel();
    LT.filesPanel.refreshPanel();
    LT.userPanel.refreshPanel();
  }
};

LT.sendLogin = function (loginName, loginPW) {
  LT.loginAjax = LT.ajaxRequest("POST", "php/login.php",
  { username : loginName, password : loginPW});
  LT.login();
}
LT.login = function () {
  var userElement = LT.loginAjax.responseXML.getElementsByTagName('user')[0];
  if (userElement) {
    LT.username = userElement.getAttribute('name');
    LT.userID = userElement.getAttribute('id');
    LT.userColor = userElement.getAttribute('color');
    LT.userPermissions = userElement.getAttribute('permissions');
    LT.pageBar.removeChild(LT.loginForm);
    LT.element('div', {id: 'loggedIn'}, LT.userButton);
    var newUsername = document.createTextNode(LT.username + "'s options");
	LT.userPanel.buttonCaption.removeChild(LT.userPanel.buttonCaption.firstChild);
	LT.userPanel.buttonCaption.appendChild(newUsername);
    LT.pageBar.appendChild(LT.userButton);
    if (LT.tableListDiv){ LT.refreshTableList(); }
	LT.element('div', {}, LT.chatOutput, "You are logged in.");
    LT.chatOutput.removeChild(LT.chatBottom);
    LT.chatOutput.appendChild(LT.chatBottom);
    LT.chatBottom.scrollIntoView(true);
	LT.refreshTables();
	LT.loadSwatches();
  } else {
    alert('Incorrect username or password.');
  }
}
LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.toggleVisibility();
  LT.pageBar.removeChild(LT.userButton);
  LT.pageBar.appendChild(LT.loginForm);
  LT.element('div', {}, LT.chatOutput, "You have logged out.");
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
}