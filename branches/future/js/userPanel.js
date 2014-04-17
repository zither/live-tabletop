$(function () { // This anonymous function runs after the page loads.
	LT.userPanel = new LT.Panel("userPanel");
	
	// options tab
	$("#logout").click(LT.logout);
	$("#createImages").click(LT.processImages);
	$("#defaultPanels").click(function () {
		LT.tablesPanel.reset();
		LT.chatPanel.reset();
		LT.turnsPanel.reset();
		LT.piecesPanel.reset();
		LT.filesPanel.reset();
		LT.userPanel.reset();
	});

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

});

