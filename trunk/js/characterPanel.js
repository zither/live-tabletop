$(function () { // This anonymous function runs after the page loads.
	LT.characterPanel = new LT.Panel("character");
});

LT.refreshCharacterList = function () {
	$.get("php/User.characters.php", function (data) {
		$("#characterList tr:not(.template)").remove();
		$.each(data, function (i, campaign) {
			var row = $("#characterList .template").clone().removeClass("template");
			row.find(".name").text(character.name).click(function () {
				$.get("php/Character.read.php", {"character": character.id},
					function (theData) {LT.loadCharacter(new LT.Character(theData));});
			});
			row.find(".campaignPermission").text(character.permission);
 			row.find(".disown").click(function () {
				$.post("php/Character.deleteOwner.php",
					{"user": LT.currentUser.id, "character": character.id},
					function () {LT.refreshCharacterList();});
			});
			row.appendTo("#characterList tbody");
		});
	});
};

