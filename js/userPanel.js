$(function () { // This anonymous function runs after the page loads.
	LT.userPanel = new LT.Panel("user");
	
	// options tab
	$("#logout").click(function () {
		$.post("php/logout.php");
		$("#map, #pageBar, .panel").hide();
		$("#welcome").show();
	});
	$("#defaultPanels").click(function () {
		LT.tablesPanel.reset();
		LT.chatPanel.reset();
		LT.turnsPanel.reset();
		LT.piecesPanel.reset();
		LT.filesPanel.reset();
		LT.userPanel.reset();
	});

/*
	// edit user tab
	var editUserPalette = new LT.Palette(null, $(".panelContent .userSettingsTab")[0], 5);
	// TODO: hook this palette up to some handler that reads it?

	// add user tab
	var addUserPalette = new LT.Palette(null, $(".panelContent .userCreationTab")[0], 5);
	$("#createUser").click(function () {
		var args = LT.formValues("#userCreator");
		args.color = addUserPalette.getColor(); // TODO: connect palettes to hidden inputs?
		$.post("php/create_user.php", args);
	});
*/

});

