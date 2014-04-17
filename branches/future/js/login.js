$(function () { // This anonymous function runs after the page loads.
	$("#loginForm input[type=button]").click(function () {
		$.post("php/login.php", $("#loginForm").serialize(), function (data) {
			LT.login(new LT.User(data[0]));
		}, "json").fail(function () {
			alert("Incorrect username or password.");
		});
	});
});

LT.loginCheck = function () {
//	LT.createUserPanel(); // FIXME: why was this here?.
	$.post("php/login_check.php", function (data) {
		LT.login(new LT.User(data[0]));
	}, "json");
};

LT.login = function (theUser) {
	LT.currentUser = theUser;

	$.post("php/read_users.php", function (data) {
		LT.users = {};
		for (var i = 0; i < data.length; i++)
			LT.users[data[i].id] = new LT.User(data[i]);
		LT.User.populateSelectors();
	}, "json");

	$("#loginForm").hide();
	$("#userButton").show();
	$("#userButtonCaption").text(LT.currentUser.name);

	LT.Piece.readImages();
	LT.Table.readImages();
	LT.Tile.readImages();

	LT.Panel.loadCookie();

	LT.alert("You have logged in.");
//	LT.refreshChatPanel(); // FIXME: don't do this until a table is loaded

	// TODO: load a table by id if there's a cookie for it
	LT.refreshTables();

	LT.holdTimestamps = 0;
	setInterval(LT.checkTimestamps, 2000);
};

LT.logout = function () {
	LT.ajaxRequest("POST", "php/logout.php", {});
	LT.userPanel.hide();
	$("#loginForm").show();
	$("#userButton").hide();
	LT.alert("You have logged out.");
	LT.currentUser = 0; // FIXME: null? delete?
};

