$(function () { // This anonymous function runs after the page loads.
	LT.userPanel = new LT.Panel("user");
	
	// My Account tab
	$("#logout").click(function () {
		$.post("php/User.logout.php");
		$("#map, #pageBar, .panel").hide();
		$("#welcome").show();
		delete LT.currentUser;
		// leave the campaign
		$.post("php/Campaign.leave.php", {campaign: this.id});
		delete LT.currentCampaign;
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
			LT.refreshUser();
			alert("You have invited " + email + " to be your friend."
				+ "They can see the request while they are using Live Tabletop.");
		});
	});
	$("#userPassword input[type=button]").click(function () {
		var args = LT.formValues("#userPassword");
		if (args.retype_password != args.password) {
			alert("New passwords do not match.");
		} else {
			delete args.retype_password;
			$.post("php/User.password.php", args, function () {
				alert("Your password has been changed.");
			});
		}
	});
	$("#userSubscribed").change(function () {
		var box = this;
		box.disabled = true;
		LT.currentUser.subscribed = box.checked ? 1 : 0;
		$.post("php/User.settings.php", LT.currentUser, function () {
			if (box.checked)
				alert("You will now recieve Live Tabletop e-mail updates.");
			else
				alert("You will no longer recieve Live Tabletop e-mail updates.");
			box.disabled = false;
		});
	});
	$("#userName input[type=button]").click(function () {
		var newName = prompt("new user name", LT.currentUser.name);
		if (newName != null && newName != LT.currentUser.name) {
			LT.currentUser.name = newName;
			$.post("php/User.settings.php", LT.currentUser, function () {
				$("#userName span").text(LT.currentUser.name || LT.currentUser.email);
			});
		}
	});
	$("#userColor").change(function () {
		LT.currentUser.color = $(this).val();
		$.post("php/User.settings.php", LT.currentUser, function () {
			alert("Your color is now " + $("#userColor").val());
		});
	});
});

LT.refreshUser = function () {
	// we only want one of these scheduled at a time
	if (LT.refreshUserTimeout) clearTimeout(LT.refreshUserTimeout);

	if (LT.currentUser) { // stop updating if no user is logged in
		if (!LT.holdTimeStamps) { // do not update while dragging
			// update friends lists
			$.get("php/User.friends.php", function (data) {
				// confirmed friends
				$("#friendsConfirmed tr:not(.template)").remove();
				$.each(data.confirmed, function (i, friend) {
					var row = $("#friendsConfirmed .template").clone().removeClass("template");
					row.find(".email").text(friend.email);
					row.find("input[value=remove]").click(function () {
						if (confirm("Permanently delete " + friend.email + " from your friends list?"))
							$.post("php/User.unfriend.php", {recipient: friend.email}, function () {
								LT.refreshUser();
							});
					});
					row.appendTo("#friendsConfirmed tbody");
					if (friend.id in LT.users) {
						LT.users[user.id].name = friend.name;
						LT.users[user.id].color = friend.color;
					} else LT.users[friend.id] = friend;
				});
				// friend requests sent by you
				if (data.requested.length == 0) LT.userPanel.hideTab("user sent");
				else LT.userPanel.showTab("user sent");
				$("#friendsRequested tr:not(.template)").remove();
				$.each(data.requested, function (i, friend) {
					var row = $("#friendsRequested .template").clone().removeClass("template");
					row.find(".email").text(friend.email);
					row.find("input[value=cancel]").click(function () {
						$.post("php/User.unfriend.php", {recipient: friend.email}, function () {
							LT.refreshUser();
						});
					});
					row.appendTo("#friendsRequested tbody");
				});
				// freind requests recieved by you
				if (data.received.length == 0) LT.userPanel.hideTab("user received");
				else LT.userPanel.showTab("user received");
				$("#friendsReceived tr:not(.template)").remove();
				$.each(data.received, function (i, friend) {
					var row = $("#friendsReceived .template").clone().removeClass("template");
					row.find(".email").text(friend.email);
					row.find("input[value=confirm]").click(function () {
						$.post("php/User.friend.php", {recipient: friend.email}, function () {
							LT.refreshUser();
						});
					});
					row.find("input[value=reject]").click(function () {
						$.post("php/User.unfriend.php", {recipient: friend.email}, function () {
							LT.refreshUser();
						});
					});
					row.appendTo("#friendsReceived tbody");
					if (friend.id in LT.users) {
						LT.users[user.id].name = friend.name;
						LT.users[user.id].color = friend.color;
					} else LT.users[friend.id] = friend;
				});
			});
			// update user's campaign, map and character lists in other panels
			LT.refreshCampaignList();
			LT.refreshMapList();
			LT.refreshCharacterList();
		} // if (!LT.holdTimeStamps) { // do not update while dragging
		LT.refreshUserTimeout = setTimeout(LT.refreshUser, 10000);
	} // if (LT.currentUser) { // stop updating if no user is logged in
};


