LT.loginCheck = function () {
  LT.userButton = LT.element('div', { id : 'loginDiv' }, LT.pageBar);
  LT.loginForm = LT.element('form', { id : 'loginForm', 
    style : 'float: right;'}, LT.pageBar);
  var checkLogin = LT.ajaxRequest("POST", "php/login_check.php",{ });
  if (checkLogin.responseXML) {
    LT.loginAjax = checkLogin;
    LT.createUserPanel();
  } else {
    LT.createLogin();
  }
};

LT.createLogin = function () {
  var loginUsername = LT.element('input', { style : 'border: 1px solid #CCC;',
    id : 'username', size : 10 }, LT.loginForm, 'username', 1);
  //loginUsername.onfocus = function(){ emptyMe(this, 'username') };
  var loginPassword = LT.element('input', { style : 'border: 1px solid #CCC;',
    id : 'password', size : 10, type : 'password' }, LT.loginForm, 'password', 1);
  var loginSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'loginSubmit', size : 8 }, LT.loginForm, 'Login');
  loginSubmit.onclick = function () {
    LT.loginAjax = LT.ajaxRequest("POST", "php/login.php",
      { username : loginUsername.value, password : loginPassword.value});
    LT.createUserPanel();
  }
};

LT.createUserPanel = function () {
  var userElement = LT.loginAjax.responseXML.getElementsByTagName('user')[0];
  if (userElement) {
    LT.username = userElement.getAttribute('name');
    LT.userID = userElement.getAttribute('id');
    LT.userColor = userElement.getAttribute('color');
    LT.userPermissions = userElement.getAttribute('permissions');
    LT.pageBar.removeChild(LT.loginForm);
    LT.element('div', {id: 'loggedIn'}, LT.loginDiv);
    LT.userPanel = new LT.Panel('User Options',
      LT.username + "'s " + 'options', 185, 26, 150, 150, LT.loginDiv);
    LT.element('div', {id: 'logoutDiv'}, LT.userPanel.content, 'Logout')
      .onclick = LT.logout;
  } else {
    alert('Incorrect username or password.');
  }
};

LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.toggleVisibility;
  LT.userPanel.outside.setAttribute('visibility', 'hidden');
  //LT.pageBar.removeChild(LT.loginDiv);
  LT.pageBar.appendChild(LT.loginForm);
}