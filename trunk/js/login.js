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
  loginSubmit.onclick = function () {
    var request = LT.ajaxRequest("POST", "php/login.php",
      {username: LT.loginUsername.value, password: LT.loginPassword.value});
    LT.login(request);
  };
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
		
    if (!LT.tablesPanel) {
      LT.Tile.readImages();
      LT.Piece.readImages();
      LT.Table.readImages();
	
  	  LT.createTablesPanel();
      LT.createPiecesPanel();
      LT.createChatPanel();
      LT.createTurnsPanel();
      LT.createFilesPanel();
	  }
    LT.refreshUsersList();
    if (LT.tableListDiv) LT.refreshTableList();
    LT.element('div', {'class' : 'chat_alert'}, LT.chatPanel.output, "You have logged in.");
    LT.chatPanel.output.removeChild(LT.chatBottom);
    LT.chatPanel.output.appendChild(LT.chatBottom);
    LT.chatBottom.scrollIntoView(true);
    LT.refreshTables();
    LT.createTools();
    LT.createPieceImages();
    LT.Panel.loadCookie();

	  LT.Table.loadPresets();
    LT.refreshMessageList();
    LT.loadTable();
    LT.holdTimestamps = 0;
    setInterval(LT.checkTimestamps, 2000);
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
	LT.currentUser = 0;
};
