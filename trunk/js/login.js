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
  var username = LT.text('username', {id: 'username', size: 10});
  var password = LT.password('password', {id: 'password', size: 10});
  var submit = LT.button('Login', function () {
    var request = LT.ajaxRequest("POST", "php/login.php",
      {username: username.value, password: password.value});
    LT.login(request);
  });
  LT.loginForm = LT.element(LT.pageBar, 'form', {id: 'loginForm'},
    [username, password, submit]);
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
    LT.element(LT.userButton, {id: 'loggedIn'});
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
    LT.chatAlert("You have logged in.");
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
  LT.chatAlert("You have logged out.");
	LT.currentUser = 0;
};
