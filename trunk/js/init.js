$(function () { // This anonymous function runs after the page loads.
	$.post("php/db_config.php", function () {
		LT.loginCheck();
	}).fail(function () {
		$("#installBox").show();
		$("#map, #pageBar").hide();
	});
});

