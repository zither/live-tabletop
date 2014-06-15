// CAMPAIGN CONSTRUCTOR
LT.Campaign = function (data) {
	for (var i = 0; i < LT.Campaign.PROPERTIES.length; i++)
		this[LT.Campaign.PROPERTIES[i]] = data[LT.Campaign.PROPERTIES[i]];
};

// GLOBAL VARIABLES
LT.Campaign.PROPERTIES = ["id", "name", "map", "private", "turns", "last_message", "users_modified"];
LT.Campaign.STRINGS = ["name", "turns"];

// {campaign: 1, name: "My Campaign", permission: null}


// METHODS OF TABLE OBJECTS
LT.Campaign.prototype = {

	// CLIENT-SERVER COMMUNICATION

	arrive: function () {
		return $.post("php/Campaign.arrive.php", {campaign: this.id});
		// TODO: read users
		// TODO: read messages
	},

	leave: function () {
		return $.post("php/Campaign.leave.php", {campaign: this.id});
	},

	avatar: function (theCharacter) {
		return $.post("php/Campaign.avatar.php", {campaign: this.id, character: theCharacter});
	},

	disown: function () {
		return $.post("php/Campaign.disown.php", {campaign: this.id});
	},

	// FIXME: is this supposed to be done in campaignPanel.js?
	message: function (theText, theCharacter) {
		return $.post("php/Campaign.message.php", {campaign: this.id, text: theText, avatar: theAvatar});
	},

	// FIXME: is this supposed to be done in campaignPanel.js?
	messages: function () {
		return $.post("php/Campaign.messages.php",
			{campaign: this.id, last_message: this.last_message},
			function (theData) {
				// TODO: add messages to the message console
				this.last_message = theData[theData.length - 1].id;
			});
	},

	// FIXME: is this supposed to be done in campaignPanel.js?
	permission: function (theUser, thePermission) {
		return $.post("php/Campaign.message.php", {campaign: this.id, user: theUser, permission: thePermission});
	},

	getMap: function () {return this.map},
	setMap: function (theMap) {
		this.map = theMap
		return $.post("php/Campaign.turns.php", {campaign: this.id, map: this.map});
	},

	getName: function () {return this.name},
	setName: function (theName) {
		this.name = theName
		return $.post("php/Campaign.name.php", {campaign: this.id, name: this.name});
	},

	getPrivate: function () {return this.private},
	setPrivate: function (thePrivacy) {
		this.private = thePrivacy;
		return $.post("php/Campaign.name.php", {campaign: this.id, name: this.private ? 1 : 0});
	},

	getTurns: function () {return this.turns;},
	setTurns: function (theTurns) {
		this.turns = theTurns;
		return $.post("php/Campaign.turns.php", {campaign: this.id, turns: JSON.stringify(this.turns)});
	},
	
}


