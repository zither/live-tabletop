LT.currentCharacter = {"id": 0};

$(function () { // This anonymous function runs after the page loads.
	LT.characterPanel = new LT.Panel("character");
	LT.characterPanel.resize = function () {
		var width = LT.characterPanel.getWidth();
		switch (LT.characterPanel.getTab()) {
			case "character list":
				$("#newCharacterName").css("max-width", width
					- $("#newCharacterSystem").width()
					- $("#createCharacter").width() - LT.GUTTERS - 7 + "px");
				$(".characterListRow").width(width - $(".disownCharacter:visible").width() - LT.GUTTERS);
				break;
		}
	};

	// hide tabs which are only needed when a character is selected
	LT.hideCharacterTabs();

	// new character form
	$("#createCharacter").click(function () {
		$.post("php/Character.create.php", {
			"name": $("#newCharacterName").val(),
			"system": $("#newCharacterSystem").val(),
		}, LT.refreshCharacterList());
	});

	// character info tab
	$("#renameCharacter").click(function () {
		var newName = prompt("new character name",
			LT.currentCharacter.name || "");
		if (newName != null && newName != LT.currentCharacter.name) {
			LT.currentCharacter.name = newName;
			LT.saveCharacterSettings();
		}
	});
	$("#system").change(function () {
		LT.currentCharacter.system = $(this).val();
		LT.saveCharacterSettings();
	});
	$("#shareCharacter").click(function () {
		$.post("php/Character.share.php", {
			"character": LT.currentCharacter.id,
			"user": $("#newCharacterOwner").val(),
		}, LT.refreshCharacterList);
	});
	$("#changePortraitURL").click(function () {
		var url = prompt("new external image URL", LT.currentCharacter.portrait || "");
		if (url != null && url != LT.currentCharacter.portrait) {
			LT.currentCharacter.portrait = url;
			$("#portraitURL").text(url || "");
			LT.saveCharacterSettings();
		}
	});

	// TODO: stats
	// TODO: notes
	// TODO: turns

}); // $(function () { // This anonymous function runs after the page loads.

// used by info, stats and notes tab to save some changes
LT.saveCharacterSettings = function () {
	$.post("php/Character.settings.php",
		LT.currentCharacter,
		LT.refreshCharacterList);
};

// read portrait images from images.json after it is loaded in LT.js
LT.readPortraitImages = function (portraitImageData) {
	$.each(portraitImageData, function (name, group) {
		$.each(group, function (i, image) {
			$("<img>").appendTo("#selectPortrait").attr({
				"title": image.file,
				"src": "images/" + image.file,
			}).addClass("swatch").click(function () {
				$("#selectPortrait *").removeClass("selected");
				$(this).addClass("selected");
				LT.currentCharacter.portrait = image.file;
				LT.saveCharacterSettings();
			});
		});
	});
};

LT.hideCharacterTabs = function () {
	LT.characterPanel.hideTab("character info");
	LT.characterPanel.hideTab("character stats");
	LT.characterPanel.hideTab("character notes");
};

LT.showCharacterTabs = function () {
	LT.characterPanel.showTab("character info");
	LT.characterPanel.showTab("character stats");
	LT.characterPanel.showTab("character notes");
};

// update the list of characters in the character panel, list tab
LT.refreshCharacterList = function () {
	$.get("php/User.characters.php", function (data) {
		$("#characterList > :not(.template)").remove();
		//LT.hideCharacterTabs(); // in case the selected character was deleted
		$.each(data, function (i, character) {
			// add each character to the character list
			var row = $("#characterList .template").clone().removeClass("template");
			row.find(".name").click(function () {
				LT.showCharacterInfo(character);
			}).text(character.name || "[unnamed character]");
 			row.find(".disown").click(function () {
				$.post("php/Character.deleteOwner.php", {
					"user": LT.currentUser.id,
					"character": character.id
				}, LT.refreshCharacterList);
			});
			row.appendTo("#characterList");
			// refresh the other tabs if the current character is already selected
			// this will also show the tabs that only apply to selected characters
			if (character.id == LT.currentCharacter.id)
				LT.showCharacterInfo(character);
		});
	});
};

// display and populate character info, stats and notes tabs for a character
LT.showCharacterInfo = function (character) {
	LT.currentCharacter = character; // remember which character is selected
	LT.showCharacterTabs(); // show tabs that only apply to selected characters
	var saveCharacterSettings = function () {
		$.post("php/Character.settings.php", LT.currentCharacter, LT.refreshCharacterList);
	};
	// character info tab
	$("#characterName").text(character.name || "[unnamed character]");
	$("#system").val(character.system);
	// TODO: character owners
	// TODO: character pieces
	$("#portrait").css("background-image", character.portrait);
	// TODO: select current portrait if it is not an external url
	// TODO: stats tab
	// TODO: notes tab
}; // LT.showCharacterInfo = function (character) {

