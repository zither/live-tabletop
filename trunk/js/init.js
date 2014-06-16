$(function () { // This anonymous function runs after the page loads.
	$.post("php/db_config.php", function () {
		$.post("php/User.check.php", function (theData) {
			LT.login(new LT.User(theData));
		}, "json").fail(function () {
			$("#welcome").show();
		});
	}).fail(function () {
		$("#map, #pageBar, .panel").hide();
		$("#installBox").show();
	});
});

