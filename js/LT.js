var LT = {};

$(function () { // This anonymous function runs after the page loads.

	// INITIALIZATION

	// get args from URL
	var args = {}
	var pairs = window.location.search.substr(1).split("&");
	for (var i = 0; i < pairs.length; i++) {
		var parts = pairs[i].split("=");
		args[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	}
	// perform special actions depending on arguments
	if (args.unsubscribeCode) { // unsubscribe from email updates
		$.post("php/User.unsubscribe.php", args, function (theData) {
			$("#unsubscribeForm").show();
		}, "json");
		// TODO: say something if unsubscribe fails
	} else if (args.resetCode) { // reset password
		// TODO: reset password immediately or only after filling out form?
		$("#passwordForm input[name=resetCode]").val(args.resetCode);
		$("#passwordForm input[name=email]").val(args.email);
		$("#passwordForm").show();
	} else if (args.location) { // automatic install
		// fill out form
		$("#installBox input[name=location]").val(args.location);
		$("#installBox input[name=database]").val(args.database);
		$("#installBox input[name=username]").val(args.username);
		$("#installBox input[name=password]").val(args.password);
		$("#installBox input[name=admin_login]").val(args.admin_login);
		$("#installBox input[name=admin_password]").val(args.admin_password);
		$("#installBox input[name=retype_password]").val(args.admin_password);
		// submit form
		if (args.location && args.database && args.username && args.password
			&& args.admin_login && args.admin_password)
				$("#installBox input[type=button]").click();
	} else { // no arguments
		// check whether live tabletop is already installed
		$.post("php/db_config.php", function () {
			// check whether the user is already logged in
			$.post("php/User.check.php", function (theUser) {
				LT.login(theUser);
			}, "json").fail(function () {
				$("#welcome").show();
			});
		}).fail(function () {
//			$("#map, #pageBar, .panel").hide();
			$("#installBox").show();
		});
	} // perform special actions depending on arguments

	// WELCOME SCREEN

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

	// SPECIAL FORMS

	// install Live Tabletop
	$("#installBox input[type=button]").click(function () {
		var formData = LT.formValues("#installBox");
		if (formData.admin_password != formData.retype_password) {
			alert("Admin passwords do not match.");
			return false;
		}
//		$.post("php/User.logout.php", function () {
			$.post("php/install.php", formData, function () {
				$.post("php/db_config.php", function () {
					$("#installBox").hide();
					$("#welcome").show();
				}).fail(function () {
					alert("Database was not properly installed. Try again.");		
				});
			});
//		});
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

}); // $(function () { // This anonymous function runs after the page loads.


// This is called AFTER the user is logged in.
LT.login = function (theUser) {
	LT.currentUser = theUser;
//	LT.users = {};
//	LT.users[theUser.id] = theUser;

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


// Store data as JSON in the browser's cookie
LT.setCookie = function (name, value) {
	document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";";
}

// Get JSON data stored in the browser's cookie
LT.getCookie = function (name) {
	var re = new RegExp('[; ]' + name + '=([^\\s;]*)');
	var cookie = (' ' + document.cookie).match(re);
	if (cookie) return JSON.parse(decodeURIComponent(cookie[1]));
};

// Creates an array from an object
LT.sortObject = function (map, sortBy) {
	sortedArray = [];
	for (id in map) sortedArray.push(map[id]);
	sortedArray.sort(function (a, b) { 
		if (a[sortBy] > b[sortBy]) return 1;
		else if (a[sortBy] == b[sortBy]) return 0;
		else return -1;
	});
	return sortedArray;
}

// Set certain properties of object to properties of modifiers
// and return those properties in a JQeury.get/post compatible object
LT.applyChanges = function (object, modifiers, properties) {
	var filteredObject = {}
	for (var i = 0; i < properties.length; i++) {
		var prop = properties[i];
		var type = typeof(modifiers[prop]);
		if (type != "undefined")
			object[prop] = modifiers[prop];
		if (type == "boolean")
			filteredObject[prop] = object[prop] ? 1 : 0;
		if (type == "string" || type == "number")
			filteredObject[prop] = object[prop];
	}
	return filteredObject;
};

LT.formValues = function (form) {
	var object = {};
	$(form).find("input, select").each(function () {
		var key = $(this).attr("name");
		if (key) object[key] = $(this).val();
	});
	return object;
};


// DRAG AND DROP TO MOVE PIECES AND RESIZE PANELS

LT.clickDragGap = 0; 
LT.dragX = 0; // current horizontal mouse position
LT.dragY = 0; // current vertical mouse position
LT.clickX = 0; // relative horizontal position of mouse when the button was pressed
LT.clickY = 0; // relative vertical position of mouse when the button was pressed
//LT.dragHandlers = [];
//LT.dropHandlers = [];
LT.DELAY = 1000;

// TODO: this doesn't seem to prevent tile image selection
$(document).on("selectstart", function (e) {return false;});

// TODO: not sure if this is helping at all
$(document).on("dragstart", function (e) {e.preventDefault(); return false;});

$(document).mousedown(function () {LT.holdTimestamps = 1;});

// Stop dragging when the mouse button is released.
$(document).mouseup(function (e) {
	if (!e) var e = window.event;
	LT.holdTimestamps = 0;
	LT.clickDragGap = 0;
});

// Move or resize a panel when the mouse is dragged.
$(document).mousemove(function (e) {
	if (!e) var e = window.event;
	// grab the X and Y position of the mouse cursor
	if (document.all) { // IE browser
		LT.dragX = e.clientX + document.body.scrollLeft;
		LT.dragY = e.clientY + document.body.scrollTop;
	} else { // NS browser
		LT.dragX = e.pageX;
		LT.dragY = e.pageY;
	}
	// prevents the dragging of images
	e.preventDefault();
	return false;
});

