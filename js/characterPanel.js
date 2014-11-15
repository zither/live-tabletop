$(function () { // This anonymous function runs after the page loads.
	LT.characterPanel = new LT.Panel("character");
});

LT.refreshCharacterList = function () {
	$.get("php/User.characters.php", function (data) {
		// TODO: replace rows of characters table
	});
};

