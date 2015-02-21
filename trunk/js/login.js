$(function () { // This anonymous function runs after the page loads.

	// login form
	$("#loginForm input[type=button]").click(function () {
		$.post("php/User.login.php", LT.formValues("#loginForm"), function (theUser) {
			LT.login(theUser);
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
		var form = LT.formValues("#signupForm");
		$.post("php/User.create.php", form, function (theData) {
			alert("A confirmation e-mail has been sent to " + form.email
				+ ". Click on the link in that e-mail to activate the account and set your password.");
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
		var form = LT.formValues("#resetPasswordForm");
		$.post("php/User.resetPassword.php", form, function (theData) {
			alert("An e-mail has been sent to " + form.email
				+ ". Click on the link in that e-mail to reset your password.");
			$("#loginForm, #signupForm").removeClass("collapsed");
			$("#signupForm").addClass("collapsed");
			$("#resetPasswordLink").show();
			$("#resetPasswordForm").hide();
		});
	});
	$("#resetPasswordLink").click(function () {LT.formValues("#passwordForm")
		$("#loginForm, #signupForm").addClass("collapsed");
		$("#resetPasswordLink").hide();
		$("#resetPasswordForm").show();
		return false; // do not follow link
	});

	// create or change password
	$("#passwordForm input[type=button]").click(function () {
		var form = LT.formValues("#passwordForm");
		if (form.password != form.retype_password)
			alert("Passwords do not match.");
		else {
			$.post("php/User.logout.php", function () {
				delete form.retype_password;
				$.post("php/User.password.php", form, function (theData) {
					delete form.resetCode;
					$.post("php/User.login.php", form, function (theData) {
						location.href = location.href.split("?")[0]; // remove ?resetCode=
					}, "json").fail(function () {
						alert("Incorrect username or password.");
					});
				});
			});
		}
	});

	// unsubscribe from e-mail announcements
	$("#unsubscribeForm a").click(function () {
		// TODO: implement unsubscribe

		location.href = location.href.split("?")[0]; // remove ?unsubscribeCode=
		return false;
	});

});

LT.login = function (theUser) {
	LT.currentUser = theUser;
//	LT.users = {};
//	LT.users[theUser.id] = theUser;

	// load images
	// TODO: start this process before logging in?
	LT.images = {};
	$.get("images/images.json", function (data) {
		// TODO: make backgrounds into pieces?
		$.each(data.backgrounds, function (i, image) {
			$("select[name=background]").append($("<option>").text(image.file));
			LT.images[image.id] = image;
		});
		$.each(data.pieces, function (i, image) {
			LT.images[image.id] = image;
		});
		$.each(data.tiles, function (i, image) {
			LT.images[image.id] = image;
			$("<img>").appendTo("#tileBrushes").attr({
				title: image.file,
				src: "images/" + image.file,
			}).addClass("swatch").click(function () {
				LT.selectedImageID = image.id;
				LT.chooseTool(this, "tile", "#clickTileLayer");
			});
		});
	});

	// hide welcome screen and show main UI
	$("#passwordForm").hide();
	$("#welcome").hide();
	$("#map, #pageBar").show();

	// fill user panel with current user settings
	$("#userName span").text(LT.currentUser.name || LT.currentUser.email);
	$("#userSubscribed")[0].checked = LT.currentUser.subscribed;
	$("#userColor").val(LT.currentUser.color);

	// restore panels from cookie
	LT.Panel.loadCookie();

	// restore campaign
	var campaign = LT.getCookie("campaign");
	if (campaign) LT.loadCampaign(campaign);

	// start periodic user updates
	LT.holdTimestamps = 0;
	LT.refreshUser();

};


