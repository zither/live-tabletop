$(function () { // This anonymous function runs after the page loads.

	// create account
	$("#signupForm input[type=button]").click(function () {
		$.post("php/User.create.php", LT.formValues("#signupForm"), function (theData) {
			LT.login(new LT.User(theData));
		}, "json");
	});

	// login form
	$("#loginForm input[type=button]").click(function () {
		$.post("php/User.login.php", LT.formValues("#loginForm"), function (theData) {
			LT.login(new LT.User(theData));
		}, "json").fail(function () {
			alert("Incorrect username or password.");
		});
	});

});

LT.login = function (theUser) {
	LT.currentUser = theUser;
	LT.alert("You have logged in.");

	$.post("php/read_users.php", function (data) {
		LT.users = {};
		for (var i = 0; i < data.length; i++)
			LT.users[data[i].id] = new LT.User(data[i]);
		LT.User.populateSelectors();
	}, "json");

	$("#welcome").hide();
	$("#map, #pageBar").show();
	$("#userButtonCaption").text(LT.currentUser.name);
	LT.Panel.loadCookie();

	LT.Piece.readImages();
	LT.Map.readImages();
	LT.Tile.readImages();

//	LT.refreshChatPanel(); // FIXME: don't do this until a campaign is loaded

	// TODO: load a table by id if there's a cookie for it
	// FIXME: campaign or map? both? what other lists?
	LT.refreshMaps();

	LT.holdTimestamps = 0;
	setInterval(LT.checkTimestamps, 2000);
};


