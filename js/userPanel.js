$(function () { // This anonymous function runs after the page loads.
	LT.userPanel = new LT.Panel("user");
	
	// My Account tab
	$("#logout").click(function () {
		$.post("php/User.logout.php");
		$("#map, #pageBar, .panel").hide();
		$("#welcome").show();
	});
	$("#defaultPanels").click(function () {
		LT.userPanel.reset();      LT.userPanel.show();
		LT.campaignPanel.reset();  LT.campaignPanel.show();
		LT.mapPanel.reset();       LT.mapPanel.show();
		LT.characterPanel.reset(); LT.characterPanel.show();
	});
	$("#friendRequest input[type=button]").click(function () {
		var email = $("#friendRequest input[name=recipient]").val();
		$.post("php/User.friend.php", {"recipient": email}, function () {
			alert("You have invited " + email + " to be your friend."
				+ "They can see the request while they are using Live Tabletop.");
		});
	});
	$("#changePassword input[type=button]").click(function () {
		var args = LT.formValues("#changePassword");
		if (args.retype_password != args.password) {
			alert("New passwords do not match.");
		} else {
			delete(args.retype_password);
			$.post("php/User.password.php", args, function () {
				alert("Your password has been changed.");
			});
		}
	});

});

LT.updateUserPanel = function () {
	$.get("php/User.friends.php", function (friends) {
		$("#friendsConfirmed tr:not[.template]").remove();
		$("#friendsRequested tr:not[.template]").remove();
		$("#friendsRecieved tr:not[.template]").remove();
		$.each(friends.confirmed, function (i, friend) {
			var row = $("#friendsConfirmed .template").clone();
			row.find(".email").text(friend);
			$("friendsConfirmed tbody").append(row);
		});
		$.each(friends.requested, function (i, friend) {
			var row = $("#friendsRequested .template").clone();
			row.find(".email").text(friend);
			$("friendsRequested tbody").append(row);
		});
		$.each(friends.received, function (i, friend) {
			var row = $("#friendsReceived .template").clone();
			row.find(".email").text(friend);
			$("friendsReceived tbody").append(row);
		});
	});
};
