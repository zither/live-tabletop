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
	$("#changePortraitURL").click(function () {
		var url = prompt("new external image URL", LT.currentCharacter.portrait || "");
		if (url != null && url != LT.currentCharacter.portrait) {
			LT.currentCharacter.portrait = url;
			$("#portraitURL").text(url || "");
			LT.saveCharacterSettings();
		}
	});

	// character users tab
	$("#shareCharacter").click(function () {
		$.post("php/Character.share.php", {
			"character": LT.currentCharacter.id,
			"user": $("#newCharacterOwner").val(),
		}, LT.refreshCharacterList);
	});

	// FIXME: temporary stats deleted when the character refreshes 
	// character stats tab
	$("#addStat").click(function () {
		LT.currentCharacter.stats.push({"name": "", "value": ""});
		LT.showStats();
	});
	$("#saveStats").click(function () {
		// TODO: should we store the stats in a buffer
		// so they aren't saved when you change other character properties?
		LT.saveCharacterSettings();
	});

	// FIXME: deleted when the character refreshes
	// character notes tab
	$("#saveNotes").click(function () {
		LT.currentCharacter.notes = $("#characterNotes").val();
		LT.saveCharacterSettings();
	});

	// character turns tab
	var saveTurns = function () {
		$.post("php/Campaign.turns.php", {
			"campaign": LT.currentCampaign.id,
			"turns": LT.currentCampaign.turns,
		}, LT.refreshCampaign());
	}
	$("#nextTurn").click(function () {
		LT.currentCampaign.turns.unshift(LT.currentCampaign.turns.pop());
		saveTurns();
	});
	$("#previousTurn").click(function () {
		LT.currentCampaign.turns.push(LT.currentCampaign.turns.shift());
		saveTurns();
	});
	$("#addTurn").click(function () {
		LT.currentCampaign.push({
			"character": parseInt($("#turnCharacter").val()),
			"description": $("#turnDescription").val(),
		});
		saveTurns();
	});

}); // $(function () { // This anonymous function runs after the page loads.

// used by info, stats and notes tab to save some changes
LT.saveCharacterSettings = function () {
	$.post("php/Character.settings.php", {
		"character": LT.currentCharacter.id,
		"name": LT.currentCharacter.name,
		"system": LT.currentCharacter.system,
		"stats": LT.currentCharacter.stats,
		"notes": LT.currentCharacter.notes,
		"portrait": LT.currentCharacter.portrait,
		"piece": LT.currentCharacter.piece,
		"color": LT.currentCharacter.color,
	}, LT.refreshCharacterList);
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
	LT.characterPanel.hideTab("character users");
	LT.characterPanel.hideTab("character stats");
	LT.characterPanel.hideTab("character notes");
};

LT.showCharacterTabs = function () {
	LT.characterPanel.showTab("character info");
	LT.characterPanel.showTab("character users");
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
				LT.characterPanel.selectTab("character info");
			}).text(character.name || "[unnamed character]");
 			row.find(".disownCharacter").click(function () {
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

	// character info tab
	$("#characterName").text(character.name || "[unnamed character]");
	$("#system").val(character.system);
	$("#portrait").css("background-image", character.portrait);
	// TODO: select current portrait if it is not an external url
	// TODO: character pieces

	// TODO: character users tab

	// character stats tab
	LT.showStats();

	// character notes tab
	$("#characterNotes").val(character.notes);

}; // LT.showCharacterInfo = function (character) {

// populate character stats tab
LT.showStats = function () {
	$("#stats > :not(.template)").remove();
	$.each(LT.currentCharacter.stats, function (i, stat) {
		var row = $("#stats .template").clone().removeClass("template");
		row.find(".name").text(stat.name);
		row.find(".value").text(stat.value);
		row.find(".remove").click(function () {
			LT.currentCharacter.stats.splice(i, 1); // remove this stat
			LT.showStats();
		});
		row.appendTo("#stats");		
	});
};

