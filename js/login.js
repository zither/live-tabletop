$(function () { // This anonymous function runs after the page loads.

	// login form
	$("#loginForm input[type=button]").click(function () {
		$.post("php/User.login.php", LT.formValues("#loginForm"), function (theData) {
			LT.login(new LT.User(theData));
		}, "json").fail(function () {
			alert("Incorrect username or password.");
		});
	});
	$("#loginForm h2").click(function () {
		$("#loginForm").removeClass("collapsed");
		$("#signupForm").addClass("collapsed");
		$("#resetPasswordForm").hide();
		$("#resetPasswordLink").show();
	});

	// create account
	$("#signupForm input[type=button]").click(function () {
		$.post("php/User.create.php", LT.formValues("#signupForm"), function (theData) {
			alert("A confirmation e-mail has been sent to foo@bar.com. " // FIXME: your e-mail address
				+ "Click on the link in that e-mail to activate the account and set your password.");
		}, "json");
	});
	$("#signupForm h2").click(function () {
		$("#signupForm").removeClass("collapsed");
		$("#loginForm").addClass("collapsed");
		$("#resetPasswordForm").hide();
		$("#resetPasswordLink").show();
	});

	// send link to reset password
	$("#resetPasswordForm input[type=button]").click(function () {
		$.post("php/User.resetPassword.php", LT.formValues("#resetPasswordForm"), function (theData) {
			alert("An e-mail has been sent to foo@bar.com. " // FIXME: your e-mail address
				+ "Click on the link in that e-mail to reset your password.");
			$("#loginForm, #signupForm").removeClass("collapsed");
			$("#signupForm").addClass("collapsed");
			$("#resetPasswordLink").show();
			$("#resetPasswordForm").hide();
		}, "json");
	});
	$("#resetPasswordLink").click(function () {LT.formValues("#passwordForm")
		$("#loginForm, #signupForm").addClass("collapsed");
		$("#resetPasswordLink").hide();
		$("#resetPasswordForm").show();
	});

	// create or change password
	$("#passwordForm input[type=button]").click(function () {
		var form = LT.formValues("#passwordForm");
		if (form.password != form.retype_password)
			alert("Passwords do not match.");
		else {
			delete form.retype_password;
			$.post("php/User.password.php", form, function (theData) {
				delete form.resetCode;
				$.post("php/User.login.php", form, function (theData) {
					LT.login(new LT.User(theData));
				}, "json").fail(function () {
					alert("Incorrect username or password.");
				});
			}, "json");
		}
	});

	// unsubscribe from e-mail announcements
	$("#unsubscribeForm a").click(function () {
		$("#unsubscribeForm").hide();
		$("#welcome").show();
		return false;
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


