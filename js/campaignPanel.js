$(function () { // This anonymous function runs after the page loads.
	LT.campaignPanel = new LT.Panel("campaign");
	LT.campaignPanel.hideTab("campaign info");
	LT.campaignPanel.hideTab("blacklist");
	LT.campaignPanel.hideTab("chat");

	// create campaign button
	$("#createCampaign input[type=button]").click(function () {
		var args = LT.formValues("#createCampaign");
		$.post("php/Campaign.create.php", args, function (theData) {
			LT.refreshCampaignList();
			LT.loadCampaign(theData.id);
		});
	});

	// campaign info form
	$("#renameCampaign").click(function () {
		var newName = prompt("new campaign name", LT.currentCampaign.name || "");
		if (newName != null && newName != LT.currentCampaign.name) {
			$.post("php/Campaign.name.php", {
				campaign: LT.currentCampaign.id,
				name: LT.currentCampaign.name = newName
			}, function () {$("#campaignName").text(newName);});
		}
	});
	$("#campaignPrivate").click(function () {
		LT.currentCampaign.private = this.checked ? 1 : 0;
		$.post("php/Campaign.private.php", {
			campaign: LT.currentCampaign.id,
			private: LT.currentCampaign.private,
		});
	});
	$("#campaignClose").click(LT.leaveCampaign);
	$("#campaignInvite").click(function () {
		$.post("php/Campaign.permission.php", {
			user: $("#campaignFriend").val(),
			campaign: LT.currentCampaign.id,
			permission: "member",
		}, LT.refreshCampaign);
	});
	$("#campaignShare").click(function () {
		$.post("php/Campaign.permission.php", {
			user: $("#campaignFriend").val(),
			campaign: LT.currentCampaign.id,
			permission: "owner",
		}, LT.refreshCampaign);
	});

	// chat
//var i = 0; var hate = "I am in control. You are my slave. ";
	$("#chatInput").keydown(function (e) {
		if (e.keyCode == 13) {
			$.post("php/Campaign.message.php", {
				campaign: LT.currentCampaign.id, text: $("#chatInput").val()
			}, function () {
//i = 0;
				$("#chatInput").val("").focus();
			});
		}
//else {$("#chatInput").val($("#chatInput").val() + hate[i]); i++; i %= hate.length; return false;}
	});
});

// Update the campagn list if that tab is visible
LT.refreshCampaignList = function () {
	if (LT.campaignPanel.getTab() != "campaign list") return;
	$.get("php/User.campaigns.php", function (data) {
		if (LT.campaignPanel.getTab() != "campaign list") return;
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

LT.loadCampaign = function (id) {

	// let the server know you are no longer viewing the previous campaign
	if (LT.currentCampaign) LT.leaveCampaign();

	// remember the current campaign when you reload
	LT.setCookie("campaign", id);

	// show campaign panel tabs that only apply to a loaded campaign
	LT.campaignPanel.showTab("campaign info");
	LT.campaignPanel.showTab("chat");
	LT.campaignPanel.selectTab("campaign info");

	// clear chat tab
	$("#chatOutput .message:not(.template)").remove();

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

LT.refreshCampaign = function () {
	// we only want one of these scheduled at a time
	if (LT.refreshCampaignTimeout) clearTimeout(LT.refreshCampaignTimeout);

	if (LT.currentUser && LT.currentCampaign) { // stop updating if no campaign is loaded
		if (!LT.holdTimeStamps) { // do not update while dragging

			$.get("php/Campaign.read.php", {
				campaign: LT.currentCampaign.id
			}, function (data) {

				// cancel this if there is no current campaign
				if (!LT.currentCampaign) return;

				// update campaign name
				$("#campaignName").text(data.name || "[unnamed campaign]");

				// update campaign private/public toggle
				$("#campaignPrivate").val(data.private);

				// update users if users_modified timestamp has changed
				// FIXME: users_modified not affected when users change their names
				// FIXME: this wasn't triggered when I invited a user to the campaign
				if (data.users_modified > LT.currentCampaign.users_modified) {
					$.get("php/Campaign.users.php", {
						campaign: LT.currentCampaign.id
					}, function (theUsers) {

						if (LT.currentMap) LT.updateCursors(theUsers);

						var currentUserCanEditThisCampaign = false;

						// add campaign owners, members and guests to campaign info tab
						$("#campaignUsers tr:not(.template)").remove();
						$.each(theUsers, function (i, user) {
							if (user.id == LT.currentUser.id && user.permission == "owner")
								currentUserCanEditThisCampaign = true;
							var copy = $("#campaignUsers .template").clone().removeClass("template");
							copy.find(".name").text(user.name || user.email);
							copy.find(".permission").change(function () {
								var before = user.permission;
								var after = $(this).val();
								var questions = [];
								if (before == after) return;
								if (user.id == LT.currentUser.id) {
									if (before == "owner") questions.push(
										"Are you sure you want to give up ownership of this campaign?");
								} else {
									if (before == "owner") questions.push("Are you sure you want to revoke"
										+ user.name + "'s ownership of this campaign?");
									if (after == "banned") questions.push("Are you sure you want to ban "
										+ user.name + " from this campaign?");
								}
								while (questions.length > 0) {
									if (!confirm(questions.shift())) {
										$(this).val(before);
										return;
									}
								}
								if (after != "guest") $.post("php/Campaign.permission.php", {
									"campaign": LT.currentCampaign.id,
									"permission": after,
									"user": user.id}, function () {LT.refreshCampaign();});
								else $.post("php/Campaign.deleteUser.php", {
									"campaign": LT.currentCampaign.id,
									"user": user.id}, function () {LT.refreshCampaign();});
							}).val(user.permission || "guest");
							if (user.id == LT.currentUser.id)
								copy.find(".permission option[value=banned]").remove();
							// TODO: replace viewing boolean with time the user last viewed the campaign
							copy.find("[value=viewing]")[0].checked = user.viewing;
							copy.find("[value=friend]").toggle(!(user.id in LT.users));
							copy.appendTo("#campaignUsers");
						}); // $.each(theUsers, function (i, user) {

						// add campaign owners, members and guests to LT.users
						LT.players = theUsers;
						LT.indexUsers();

						// show or hide controls based on whether you are a campaign owner
						if (currentUserCanEditThisCampaign) LT.mapPanel.enable();
						$(".campaignOwner").toggle(currentUserCanEditThisCampaign);

					}); // $.get("php/Campaign.users.php", {
				} // if (data.users_modified > LT.currentCampaign.users_modified) {

				// update blacklist
				if (data.users_modified > LT.currentCampaign.users_modified) {
					$.get("php/Campaign.blacklist.php", {
						campaign: LT.currentCampaign.id
					}, function (theUsers) {
						if (theUsers.length == 0) LT.campaignPanel.hideTab("blacklist");
						else LT.campaignPanel.showTab("blackList");
						$("#blacklist tr:not(.template)").remove();
						$.each(theUsers, function (i, user) {
							var copy = $("#blacklist .template").clone().removeClass("template");
							copy.find(".email").text(user.email);
							copy.find("[value=remove]").click(function () {
								if (confirm("Are you sue you want to remove " + user.email + " from the blacklist?")) {
									$.post("php/Campaign.permission.php", {
										user: user.email,
										campaign:  LT.currentCampaign.id,
										permission: "banned"
									}, function () {LT.refreshCampaignList();});
								}
							});
							copy.appendTo("#blacklist");
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

				// load or unload maps
				if (data.map) {
//					LT.showMapTabs();
					if (LT.currentCampaign.map != data.map) LT.loadMap(data.map);
				} else {
					LT.hideMapTabs();
					if (LT.currentCampaign.map) LT.leaveMap();
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
								name = LT.users[message.user].name || LT.users[message.user].email;
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
		LT.refreshCampaignTimeout = setTimeout(LT.refreshCampaign, LT.DELAY);
	} // if (LT.currentUser && LT.currentCampaign) { // stop updating if no campaign is loaded
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
	// remove the campaign owners, members and guests from LT.users
	LT.players = [];
	LT.indexUsers();
	// hide campaign-specific tabs
	LT.campaignPanel.hideTab("campaign info");
	LT.campaignPanel.hideTab("blacklist");
	LT.campaignPanel.hideTab("chat");
	// cannot view maps without a campaign
	if (LT.currentMap) LT.leaveMap();
	// drop campaign info after temporarily storing the campaign id
	var args = {campaign: LT.currentCampaign.id};
	delete LT.currentCampaign;
	// Let the server know that you aren't viewing the campaign anymore
	// return a chainable object so you can schedule stuff when this is done
	return $.post("php/Campaign.leave.php", args);
};

