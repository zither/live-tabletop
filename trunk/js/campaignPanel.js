$(function () { // This anonymous function runs after the page loads.
	LT.campaignPanel = new LT.Panel("campaign");

	$("#chatForm").submit(function () {
		if (!LT.currentTable) return false;
		var args = {table_id: LT.currentTable.id, text: $("#chatInput").val()};
		$.post("php/create_message.php", args, function () {
			$("#chatInput").val("").focus();
			LT.refreshChatPanel();
		});
		return false;
	});
});

LT.updateCampaign = function () {
	if (LT.currentUser && LT.currentCampaign) {
		if (!LT.holdTimeStamps) {
			var args = {campaign: LT.currentCampaign.id};
			$.get("php/Campaign.read.php", args, function (data) {

				// update campaign name
				$("#campaignName").text(data.name);

				// update campaign private/public toggle
				$("#campaignPrivate").val(data.private);

				// TODO: update users if users_modified timestamp has changed
				// TODO: update turns (json object)
				// TODO: update map (id number) - open map | change map | close map

				// load new chat messages.
				if (data.last_message > LT.lastMessageID) {
					var args = {campaign: LT.currentCampaign.id, last_message: LT.lastMessageID};
					$.post("php/Campaign.messages.php", args, function (data) {
						//$("#chatOutput .message").remove();
						for (var i = 0; i < data.length; i++) {
							// TODO: generate from an HTML template?
							$("<div>").insertBefore("#chatBottom").addClass("message").append([
								$("<span>").text("[" + LT.formatTime(data[i].time) + "]"),
								$("<span>").text(" " + LT.users[data[i].user_id].name + ": "),
								$("<span>").html(data[i].text),
							]);
							LT.lastMessageID = data[i].id;
						}
						$("#chatBottom")[0].scrollIntoView(true);
					});
				}

				LT.currentCampaign = new LT.Campaign(data);

			});
		}
		setTimeout(LT.updateCampaign, 2000);
	}
}

LT.refreshChatPanel = function () {
	if (!LT.currentTable) return;
	var args = {table_id: LT.currentTable.id, last_message: LT.lastMessageID};
	$.post("php/read_messages.php", args, function (data) {
//		$("#chatOutput .message").remove();
		for (var i = 0; i < data.length; i++) {
			// TODO: generate from an HTML template?
			$("<div>").insertBefore("#chatBottom").addClass("message").append([
				$("<span>").text("[" + LT.formatTime(data[i].time) + "]"),
				$("<span>").text(" " + LT.users[data[i].user_id].name + ": "),
				$("<span>").html(data[i].text),
			]);
			LT.lastMessageID = data[i].id;
		}
		$("#chatBottom")[0].scrollIntoView(true);
	});
};

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

// Add a client-side message to the chat window.
// TODO: not bound to tables, separate from chat? new notification system?
LT.alert = function (text) {
	$("#chatBottom").before(
		text ? $("<div>").addClass("alert").text(text) : $("<br>")
	)[0].scrollIntoView(true)
};

