$(function () { // This anonymous function runs after the page loads.
	LT.campaignPanel = new LT.Panel("campaign");
	LT.campaignPanel.hideTab("campaign info");
	LT.campaignPanel.hideTab("blacklist");
	LT.campaignPanel.hideTab("chat");

	$("#createCampaign input[type=button]").click(function () {
		var args = LT.formValues("#createCampaign");
		$.post("php/Campaign.create.php", args, function (theData) {
			LT.refreshCampaignList();
			LT.loadCampaign(theData.id);
		});
	});
	$("#chatForm input[value=send]").click(function () {
//		if (!LT.currentCampaign) return false;
		var args = {campaign: LT.currentCampaign.id, text: $("#chatInput").val()};
		$.post("php/Campaign.message.php", args, function () {
			$("#chatInput").val("").focus();
//			LT.refreshChatPanel();
		});
		return false;
	});
});

LT.loadCampaign = function (id) {
	// show campaign panel tabs that only apply to a loaded campaign
	LT.campaignPanel.showTab("campaign info");
	LT.campaignPanel.showTab("chat");

	// clear chat tab
	$("#chatOutput .message:not(.template)").remove();

	// let the server know you are no longer viewing the previous campaign
	if (LT.currentCampaign) LT.leaveCampaign();

	// let the server know you are viewing the campaign
	$.post("php/Campaign.arrive.php", {campaign: id});

	// create a default campaign object
	LT.currentCampaign = {
		"id": id,
		"name": "",
		"private": true,
		"turns": [],
		"users_modified": 0,
		"last_messsage": 0,
		"map": null
	};

	// start periodic campaign updates
	LT.refreshCampaign();
};

LT.refreshCampaignList = function () {
	$.get("php/User.campaigns.php", function (data) {
		$("#campaignList tr:not(.template)").remove();
		$.each(data, function (i, campaign) {
			var row = $("#campaignList .template").clone().removeClass("template");
			row.find(".name").text(campaign.name || "[unnamed campaign]").click(function () {
				LT.loadCampaign(campaign.campaign);
			});
			row.find(".permission").text(campaign.permission);
 			row.find(".disown").click(function () {
				$.post("php/Campaign.deleteUser.php",
					{"user": LT.currentUser.id, "campaign": campaign.campaign},
					function () {LT.refreshCampaignList();});
			});
			row.appendTo("#campaignList tbody");
		});
	});
};

LT.refreshCampaign = function (id) {
	// we only want one of these scheduled at a time
	if (LT.refreshCampaignTimeout) clearTimeout(LT.refreshCampaignTimeout);

	if (id || LT.currentUser && LT.currentCampaign) { // stop updating if no campaign is loaded
		if (!LT.holdTimeStamps) { // do not update while dragging

			$.get("php/Campaign.read.php", {
				campaign: LT.currentCampaign.id
			}, function (data) {

				// update campaign name
				$("#campaignName").text(data.name || "[unnamed campaign]");

				// update campaign private/public toggle
				$("#campaignPrivate").val(data.private);

				// update users if users_modified timestamp has changed
				// FIXME: users_modified not affected when users change their names
				// TODO: list of blacklisted users
				if (data.users_modified > LT.currentCampaign.users_modified) {
					$.get("php/Campaign.users.php", {
						campaign: LT.currentCampaign.id
					}, function (theUsers) {
						// add campaign owners, members and guests to LT.users
						LT.players = theUsers;
						LT.indexUsers();
						// add campaign owners members and guests to campaign info tab
						$("#campaignUsers tr:not(.template)").remove();
						$.each(theUsers, function (i, user) {
							$copy = $("#campaignUsers .template").clone().removeClass("template");
							$copy.find(".name").text(user.name);
							$copy.find(".permission").change(function () {
								var before = user.permission;
								var after = $(this).val();
								if (before != "owner" || confirm("Are you sure you want to revoke"
									+ user.name + "'s ownership of this campaign?")) {
									if (after == "owner" || after == "member" || after == "banned" && confirm(
									"Are you sure you want to ban " + user.name + " from this campaign?")) {
										$.post("php/Campaign.permission.php", {
											"campaign": LT.currentCampaign.id,
											"user": user.id,
											"permission": after
										}, function () {LT.refreshCampaign();});
									}
									if (after == "guest") {
										$.post("php/Campaign.deleteUser.php", {
											"campaign": LT.currentCampaign.id,
											"user": user.id
										}, function () {LT.refreshCampaign();});
									}
								}
							}).val(user.permission || "guest");
							$copy.find("[value=viewing]")[0].checked = user.viewing;
							$copy.appendTo("#campaignUsers");
						});
					});
				}
						
				// update blacklist
				if (data.users_modified > LT.currentCampaign.users_modified) {
					$.get("php/Campaign.blacklist.php", {
						campaign: LT.currentCampaign.id
					}, function (theUsers) {
						$("#blacklist tr:not(.template)").remove();
						$.each(theUsers, function (i, user) {
							$copy = $("#blacklist .template").clone().removeClass("template");
							$copy.find(".email").text(user.email);
							$copy.find("[value=remove]").click(function () {
								if (confirm("Are you sue you want to remove " + user.email + " from the blacklist?")) {
									$.post("php/Campaign.permission.php", {
										user: user.email,
										campaign:  LT.currentCampaign.id,
										permission: "banned"
									}, function () {LT.refreshCampaignList();});
								}
							});
							$copy.appendTo("#blacklist");
						});						
					});
				}

				// update turns (json object)
				// TODO: should this be in characterPanel.js?
				$.each(data.turns, function (i, turn) {
					$("#turns tr:not(.template)").remove();
					var copy = $("#turns .template").clone().removeClass("template");
					copy.find(".name").text(turn.name);
					copy.find("input[value=up]").click(function () {
						alert("TODO: do something when you click up button in turns list.");
					});
					copy.find("input[value=down]").click(function () {
						alert("TODO: do something when you click down button in turns list.");
					});
					copy.find("input[value=rename]").click(function () {
						alert("TODO: do something when you click rename button in turns list.");
					});
					copy.find("input[value=remove]").click(function () {
						alert("TODO: do something when you click remove button in turns list.");
					});
					copy.appendTo("#turns");
				});

				// update map (id number)
				if (LT.currentCampaign.map != data.map) {
					// TODO: close map
					LT.currentCampaign.map = null;
				}
				if (data.map && !(LT.currentCampaign.map)) {
					// TODO: open map
				}

				// load new chat messages.
				if (data.last_message > LT.currentCampaign.last_message) {
					$.post("php/Campaign.messages.php", {
						campaign: LT.currentCampaign.id,
						last_message: LT.currentCampaign.last_message
					}, function (theMessages) {
						$.each(theMessages, function (i, message) {
							var name = "[unknown user]";
							if (message.user in LT.users)
								name = LT.users[message.user].name;
							copy = $("#chatOutput .template").clone().removeClass("template");
							copy.find(".time").text("[" + LT.formatTime(message.time) + "]");
							copy.find(".user").text(" " + name + ": ");
							copy.find(".text").html(message.text);
							copy.insertBefore("#chatBottom");
							LT.currentCampaign.last_message = message.id;
						});
						$("#chatBottom")[0].scrollIntoView(true);
					});
				}

				LT.currentCampaign = data; //new LT.Campaign(data);
			});
		} // if (!LT.holdTimeStamps) { // do not update while dragging
		LT.refreshCampaignTimeout = setTimeout(LT.refreshCampaign, 10000);
	} // if (id || LT.currentUser && LT.currentCampaign) { // stop updating if no campaign is loaded
}

// Format time as year.month.day hour:minute (or just hour:minute if today.)
LT.formatTime = function (seconds) {
	var time = new Date(seconds * 1000);
	var minutes = ("00" + time.getMinutes()).slice(-2); // zero-padding
	if (time.toDateString() == (new Date()).toDateString())
		// if the message is from today, then only show hours and minutes
		return time.getHours() + ":" + minutes;
	else
		// if it is not from today, show year, month, day, hours and minutes
		return time.getFullYear() + "." + (time.getMonth() + 1) + "."
			+ time.getDate() + " " + time.getHours() + ":" + minutes;
};

LT.leaveCampaign = function () {
	// Let the server know that you aren't viewing the campaign anymore
	$.post("php/Campaign.leave.php", {campaign: this.id});
	// remove the campaign owners, members and guests from LT.users
	LT.players = [];
	LT.indexUsers();
	// hide campaign-specific tabs
	LT.campaignPanel.hideTab("campaign info");
	LT.campaignPanel.hideTab("blacklist");
	LT.campaignPanel.hideTab("chat");
	// drop campaign info
	delete LT.currentCampaign;
}

