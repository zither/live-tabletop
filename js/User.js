// USER CONSTRUCTOR
LT.User = function (data) {
	for (var i = 0; i < LT.User.PROPERTIES.length; i++)
		this[LT.User.PROPERTIES[i]] = data[LT.User.PROPERTIES[i]];
}

// GLOBAL VARIABLES
LT.User.PROPERTIES = ["color", "email", "name", "subscribed"];

// STATIC FUNCTIONS
LT.User.populateSelectors = function () {
	$("#userEditor [name=user_id]").empty();
	$("#pieceEditor [name=user_id]").empty();
	$("#pieceCreator [name=user_id]").empty();
	var sortedArray = LT.sortObject(LT.users, "name");
	for (var i = 0; i < sortedArray.length; i++)
		$("<option>")
			.attr({value: sortedArray[i].id})
			.text(sortedArray[i].name)
			.appendTo("#userEditor [name=user_id]")
			.clone().appendTo("#pieceEditor [name=user_id]")
			.clone().appendTo("#pieceCreator [name=user_id]");
	$("#pieceCreator [name=user_id]").val(LT.currentUser.id);
	$("#userEditor [name=user_id]").change(function () {
		$("#userEditor [name=username]")
			.val(LT.users[parseInt($(this).val())].name);
	});
};

// METHODS OF USER OBJECTS
LT.User.prototype = {

	// CLIENT-SERVER COMMUNICATION
	update: function (mods) {
		var args = LT.applyChanges(this, mods, LT.User.PROPERTIES);
		return $.post("php/User.settings.php", args);
	},
/*
	remove: function () {
		return $.post("php/delete_user.php", {user_id: this.id});
	},
*/
}

