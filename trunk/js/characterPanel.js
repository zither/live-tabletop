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

	LT.hideCharacterTabs();

	$("#createCharacter").click(function () {
		$.post("php/Character.create.php", {
			"name": $("#newCharacterName").val(),
			"system": $("#newCharacterSystem").val(),
		}, LT.refreshCharacterList());
	});

});

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


LT.refreshCharacterList = function () {
	$.get("php/User.characters.php", function (data) {
		$("#characterList > :not(.template)").remove();
		$.each(data, function (i, character) {
			var row = $("#characterList .template").clone().removeClass("template");
			row.find(".name").click(function () {
				$.get("php/Character.read.php", {"character": character.id},
					function (theData) {LT.showCharacterInfo(theData);});
			}).text(character.name || "[unnamed character]");
 			row.find(".disown").click(function () {
				$.post("php/Character.deleteOwner.php", {
					"user": LT.currentUser.id,
					"character": character.id
				}, LT.refreshCharacterList);
			});
			row.appendTo("#characterList");
		});
	});
};

LT.showCharacterInfo = function (character) {
	LT.showCharacterTabs();
	// TODO: populate info, stats and notes tabs with this character's info.
};

