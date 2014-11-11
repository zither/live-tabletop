$(function () { // This anonymous function runs after the page loads.
	LT.userPanel = new LT.Panel("user");
	
	// My Account tab
	$("#logout").click(function () {
		$.post("php/User.logout.php");
		$("#map, #pageBar, .panel").hide();
		$("#welcome").show();
		delete LT.currentUser;
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
			delete args.retype_password;
			$.post("php/User.password.php", args, function () {
				alert("Your password has been changed.");
			});
		}
	});

});

LT.updateUser = function () {
	if (LT.currentUser) {
		if (!LT.holdTimeStamps) {
			// update friends lists
			$.get("php/User.friends.php", function (data) {
				$("#friendsConfirmed tr:not(.template)").remove();
				$("#friendsRequested tr:not(.template)").remove();
				$("#friendsReceived tr:not(.template)").remove();
				$.each(data.confirmed, function (i, friend) {
//					console.log(JSON.stringify(friend));
					var row = $("#friendsConfirmed .template").clone().removeClass("template");
					row.find(".email").text(friend);
					row.appendTo("#friendsConfirmed tbody");
				});
				$.each(data.requested, function (i, friend) {
//					console.log(JSON.stringify(friend));
					var row = $("#friendsRequested .template").clone().removeClass("template");
					row.find(".email").text(friend);
					row.appendTo("#friendsRequested tbody");
				});
				$.each(data.received, function (i, friend) {
//					console.log(JSON.stringify(friend));
					var row = $("#friendsReceived .template").clone().removeClass("template");
					row.find(".email").text(friend);
					row.appendTo("#friendsReceived tbody");
				});
			});
			// update campaigns list
			$.get("php/User.campaigns.php", function (data) {
				// TODO: replace rows of campaigns table
			});
			// update maps list
			$.get("php/User.maps.php", function (data) {
				// TODO: replace rows of maps table
			});
			// update characters list
			$.get("php/User.characters.php", function (data) {
				// TODO: replace rows of characters table
			});
		}
		setTimeout(LT.updateUser, 10000);
	}
}

