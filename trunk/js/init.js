$(function () { // This anonymous function runs after the page loads.

	// get args from URL
	var args = {}
	var pairs = window.location.search.substr(1).split("&");
	for (var i = 0; i < pairs.length; i++) {
		var parts = pairs[i].split("=");
		args[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	}

	if (args.unsubscribeCode) {
		$.post("php/User.unsubscribe.php", args, function (theData) {
			$("#unsubscribeForm").show();
		}, "json");
		// TODO: say something if unsubscribe fails
	} else if (args.resetCode) {
		// TODO: reset password immediately or only after filling out form?
		$("#passwordForm input[name=resetCode]").val(args.resetCode);
		$("#passwordForm input[name=email]").val(args.email);
		$("#passwordForm").show();
	} else {
		$.post("php/db_config.php", function () {
			$.post("php/User.check.php", function (theData) {
				LT.login(new LT.User(theData));
			}, "json").fail(function () {
				$("#welcome").show();
			});
		}).fail(function () {
//			$("#map, #pageBar, .panel").hide();
			$("#installBox").show();
		});
	}
});

