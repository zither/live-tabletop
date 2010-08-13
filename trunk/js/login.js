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
  loginSubmit.onclick = LT.sendLogin;
};

LT.createUserPanel = function () {
  LT.userButton = LT.element('div', { id : 'loginDiv' });
  LT.userPanel = new LT.Panel('User Options', "'s options", 185, 26, 150, 150, LT.userButton);
  LT.element('div', {id: 'logoutDiv'}, LT.userPanel.content, 'Logout')
    .onclick = LT.logout;
};

LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.toggleVisibility();
  LT.pageBar.removeChild(LT.userButton);
  LT.pageBar.appendChild(LT.loginForm);
}
LT.sendLogin = function () {
  LT.loginAjax = LT.ajaxRequest("POST", "php/login.php",
  { username : LT.loginUsername.value, password : LT.loginPassword.value});
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
//    LT.userPanel.buttonTitle = "hello";
    var newUsername = document.createTextNode(LT.username + "'s options");
	LT.userPanel.buttonCaption.removeChild(LT.userPanel.buttonCaption.firstChild);
	LT.userPanel.buttonCaption.appendChild(newUsername);
    LT.pageBar.appendChild(LT.userButton);
    
  } else {
    alert('Incorrect username or password.');
  }
}