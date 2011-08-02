LT.loginCheck = function () {
  LT.createLogin();
  LT.createUserPanel();
  var request = LT.ajaxRequest("POST", "php/login_check.php",{ });
  if (request.responseXML) {
    LT.login(request);
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
  LT.ajaxRequest("POST", "php/create_user.php", {
    username : LT.inputUserName.value,
    permissions : 'user', 
    password : LT.inputPassword.value,
  });
};

LT.sendLogin = function (loginName, loginPassword) {
  var request = LT.ajaxRequest("POST", "php/login.php",
    { username : loginName, password : loginPassword});
  LT.login(request);
};

LT.login = function (loginRequest) {
  var userElement = loginRequest.responseXML.getElementsByTagName('user')[0];
  LT.currentUser = new LT.User(userElement);
  var request = LT.ajaxRequest("POST", "php/read_users.php",{});
  if (request.responseXML) {
    var userElements = request.responseXML.getElementsByTagName('user');
    LT.users = [];
    for (var i = 0 ; i < userElements.length; i++) {
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
    LT.refreshUsersList();
    if (LT.tableListDiv) LT.refreshTableList();
    LT.element('div', {'class' : 'chat_alert'}, LT.chatPanel.output, "You are logged in.");
    LT.chatPanel.output.removeChild(LT.chatBottom);
    LT.chatPanel.output.appendChild(LT.chatBottom);
    LT.chatBottom.scrollIntoView(true);
    LT.refreshTables();
    LT.createTools();
    LT.createPieceImages();
    LT.Panel.loadCookie();
  } else {
    alert('Incorrect username or password.');
  }
};

LT.logout = function () {
  LT.ajaxRequest("POST", "php/logout.php", {});
  LT.userPanel.hide();
  LT.pageBar.removeChild(LT.userButton);
  LT.pageBar.appendChild(LT.loginForm);
  LT.element('div', {'class' : 'chat_alert'}, LT.chatPanel.output, "You have logged out.");
  LT.chatPanel.output.removeChild(LT.chatBottom);
  LT.chatPanel.output.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
};
