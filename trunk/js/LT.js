var LT = {};

LT.brush = null; // paint "tile", "wall" or "fog"
LT.selectedImage = "";
LT.selectedImageID = -1;

// Store data as JSON in the browser's cookie
LT.setCookie = function (name, value) {
	document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";";
}

// Get JSON data stored in the browser's cookie
LT.getCookie = function (name) {
	var re = new RegExp('[; ]' + name + '=([^\\s;]*)');
	var cookie = (' ' + document.cookie).match(re);
	if (cookie) return JSON.parse(decodeURIComponent(cookie[1]));
};

// Creates an array from an object
LT.sortObject = function (map, sortBy) {
	sortedArray = [];
	for (id in map) sortedArray.push(map[id]);
	sortedArray.sort(function (a, b) { 
		if (a[sortBy] > b[sortBy]) return 1;
		else if (a[sortBy] == b[sortBy]) return 0;
		else return -1;
	});
	return sortedArray;
}

// Set certain properties of object to properties of modifiers
// and return those properties in a JQeury.get/post compatible object
LT.applyChanges = function (object, modifiers, properties) {
	var filteredObject = {}
	for (var i = 0; i < properties.length; i++) {
		var prop = properties[i];
		var type = typeof(modifiers[prop]);
		if (type != "undefined")
			object[prop] = modifiers[prop];
		if (type == "boolean")
			filteredObject[prop] = object[prop] ? 1 : 0;
		if (type == "string" || type == "number")
			filteredObject[prop] = object[prop];
	}
	return filteredObject;
};

LT.formValues = function (form) {
	var object = {};
	$(form).find("input, select").each(function () {
		var key = $(this).attr("name");
		if (key) object[key] = $(this).val();
	});
	return object;
};


// DRAG AND DROP TO MOVE PIECES AND RESIZE PANELS

LT.clickDragGap = 0; 
LT.dragX = 0; // current horizontal mouse position
LT.dragY = 0; // current vertical mouse position
LT.clickX = 0; // relative horizontal position of mouse when the button was pressed
LT.clickY = 0; // relative vertical position of mouse when the button was pressed
LT.dragHandlers = [];
LT.dropHandlers = [];

document.onselectstart = function () {return false;}

// Stop dragging when the mouse button is released.
document.onmouseup = function (e) {
	if (!e) var e = window.event;
	LT.holdTimestamps = 0;
	for (var i = 0; i < LT.dropHandlers.length; i++)
		LT.dropHandlers[i](e);
	LT.clickDragGap = 0;
}

document.onmousedown = function () {
	LT.holdTimestamps = 1;
}

// Move or resize a panel when the mouse is dragged.
document.onmousemove = function (e) {
	if (!e) var e = window.event;
	// grab the X and Y position of the mouse cursor
	if (document.all) { // IE browser
		LT.dragX = e.clientX + document.body.scrollLeft;
		LT.dragY = e.clientY + document.body.scrollTop;
	} else { // NS browser
		LT.dragX = e.pageX;
		LT.dragY = e.pageY;
	}
	for (var i = 0; i < LT.dragHandlers.length; i++)
		LT.dragHandlers[i](e);
	e.preventDefault();
	return false;
};


