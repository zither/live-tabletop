/*
The LT.Panel constructor takes one argument, the CSS classname
shared by the panel and the button that toggles it.
*/

// PANEL CONSTRUCTOR

LT.Panel = function (name) {

	this.tabs = [];
	this.selectedTab = 0;
	this.button = $(".panelButton[data-panel='" + name + "']")[0];
	this.outside = $(".panel[data-panel='" + name + "']")[0];

	// Set default parameters
	this.defaultX = this.getX();
	this.defaultY = this.getY();
	this.defaultWidth = this.getWidth();
	this.defaultHeight = this.getHeight();

	this.setX(this.getX());
	this.setY(this.getY());
	this.setHeight(this.getHeight());
	this.setWidth(this.getWidth());

	LT.Panel.list.push(this); // panels in the order they were created
	LT.Panel.order.push(this); // panels in back-to-front order

	var self = this; // remember the current "this" during event handlers
	$(this.button).click(function () {
		if ($(self.outside).css("display") == "none") self.show();
		else self.hide();
		LT.Panel.saveCookie();
		return false;
	});

	$(this.outside).css({"z-index": LT.Panel.order.length})
		.mousedown(function () {self.bringToFront();});

	// corner resize handles
	$(this.outside).find(".resizeTL").mousedown(function () {LT.Panel.selectedTL = self; return false;});
	$(this.outside).find(".resizeTR").mousedown(function () {LT.Panel.selectedTR = self; return false;});
	$(this.outside).find(".resizeBL").mousedown(function () {LT.Panel.selectedBL = self; return false;});
	$(this.outside).find(".resizeBR").mousedown(function () {LT.Panel.selectedBR = self; return false;});

	// title bar for dragging the panel around
	$(this.outside).find(".title").mousedown(function () {
		self.bringToFront();
		LT.Panel.selected = self;
		return false;
	});

	// close button
	$(this.outside).find(".close").click(function () {self.hide(); LT.Panel.saveCookie(); return false;});

	// make tabs
	$(this.outside).find(".tab").each(function () {
		$(this).click(function () {
			self.selectTab($(this).data("tab"));
			LT.Panel.saveCookie();
			return false;
		});
	});
	// show contents of the initially selected tab
	this.selectTab($(this.outside).find(".tab.active").data("tab"));
}


// GLOBAL VARIABLES

LT.Panel.order = []; // panels in back-to-front order
LT.Panel.list = []; // panels in the order they were created

LT.Panel.selected = null; // panel being moved, null if no panel is being moved
LT.Panel.selectedTL = null; // panel being resized with the top left handle
LT.Panel.selectedTR = null; // panel being resized with the top right handle
LT.Panel.selectedBL = null; // panel being resized with the bottom left handle
LT.Panel.selectedBR = null; // panel being resized with the bottom right handle
LT.Panel.clickCornerX = 0; // horizontal position of corner being resized
LT.Panel.clickCornerY = 0; // vertical position of corner being resized

// TODO: explain each of these margins
LT.Panel.PAGEBAR_HEIGHT = 26;
LT.Panel.MIN_WIDTH = 140;

// STATIC FUNCTIONS

// Save panel positions
LT.Panel.saveCookie = function () {
	var cookieArray = [];
	for (var i = 0; i < LT.Panel.list.length; i++)
		cookieArray.push(LT.Panel.list[i].getCookie());
	LT.setCookie("panels", cookieArray);
}

// Load panel positions
LT.Panel.loadCookie = function () {
	var cookieArray = LT.getCookie("panels");
	if (cookieArray) {
		for (var i = 0; i < LT.Panel.list.length; i++)
			LT.Panel.list[i].restoreFromCookie(cookieArray[i]);
	}
}

// If a panel is being moved or resized, update it's dimensions.
LT.dragHandlers.push(function () {
	if (LT.Panel.selected) LT.Panel.selected.move();
	if (LT.Panel.selectedBL) LT.Panel.selectedBL.resizeBL();
	if (LT.Panel.selectedBR) LT.Panel.selectedBR.resizeBR();
	if (LT.Panel.selectedTR) LT.Panel.selectedTR.resizeTR();
	if (LT.Panel.selectedTL) LT.Panel.selectedTL.resizeTL();
});

// Stop moving or resizing panels.
LT.dropHandlers.push(function () {
	LT.Panel.selected = null;
	LT.Panel.selectedTR = null;
	LT.Panel.selectedTL = null;
	LT.Panel.selectedBR = null;
	LT.Panel.selectedBL = null;
	LT.Panel.saveCookie();
});


// METHODS OF PANEL OBJECTS

LT.Panel.prototype = {

	// Select a tab
	selectTab: function (tabName) {
		$(this.outside).find(".tab").removeClass("active");
		$(this.outside).find(".content").hide();
		$(this.outside).find(".tab[data-tab='" + tabName + "']").addClass("active");
		$(this.outside).find(".content[data-tab='" + tabName + "']").show();
	},

	// Get selected tab
	getTab: function () {
		return $(this.outside).find(".tab.active").data("tab");
	},

	// Hide tab
	hideTab: function (tabName) {
		var tab = $(this.outside).find(".tab[data-tab='" + tabName + "']");
		tab.hide();
		// TODO: limit this selection to visible (display: block instead of display: none) tabs
		if (tab.hasClass("active"))
			this.selectTab($(this.outside).find(".tab").data("tab"));
	},
	
	// Show tab
	showTab: function (tabName) {
		var tab = $(this.outside).find(".tab[data-tab='" + tabName + "']");
		tab.show();
		// TODO: should this be able to happen?
		if (tab.hasClass("active"))
			$(this.outside).find(".content[data-tab='" + tabName + "']").show();
	},
	
	// Restore default dimensions
	reset: function () {
		this.setX(this.defaultX);
		this.setY(this.defaultY);
		this.setWidth(this.defaultWidth);
		this.setHeight(this.defaultHeight);
	},

	// Show this panel
	show: function () {
		this.bringToFront();
		$(this.button).addClass("checked");
		$(this.outside).show();
	},

	// Hide this panel
	hide: function () {
		$(this.button).removeClass("checked");
		$(this.outside).hide();
	},

	// Show this panel's button
	showButton: function () {$(this.button).show();},

	// Hide this panel's button
	hideButton: function () {$(this.button).hide();},

	// Move this panel to the top of the stack
	bringToFront: function () {
		var newOrder = [];
		for (var i = 0; i < LT.Panel.order.length; i++) {
			var panel = LT.Panel.order[i];
			if (panel != this) {
				newOrder.push(panel);
				$(panel.outside).css("z-index", newOrder.length);
			}
		}
		newOrder.push(this);
		$(this.outside).css("z-index", newOrder.length);
		LT.Panel.order = newOrder;
	},

	// Get this panel's dimensions as a string for saving in a cookie
	getCookie: function () {
		return {
			x: this.getX(),
			y: this.getY(),
			width: this.getWidth(),
			height: this.getHeight(),
			visible: $(this.outside).css("display") == "none" ? false : true,
			tab: $(this.outside).find(".tab.active").data("tab")
		};
	},

	// Load this panel's dimensions from a string saved in a cookie
	restoreFromCookie: function (data) {
		if (typeof(data.x) == "undefined") return;
		this.setX(data.x);
		this.setY(data.y);
		this.setWidth(data.width);
		this.setHeight(data.height);
		if (data.visible) this.show(); else this.hide();
		this.selectTab(data.tab);
	},

/*
TODO: The move and resize methods are complex, confusing, obscure.
Maybe detailed comments and more meaningful variable names will help
Or maybe we should change how we do it.

 - what is LT.clickDragGap for?
 - what are LT.clickX/Y/W/H/T/B and LT.dragX/Y, and what is the difference?
 - what about LT.Panel.clickCornerX/Y?
 - which of these variables are used only for panels?

*/

	// Move panel.
	move: function () {
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX - this.getX();
			LT.clickY = LT.dragY - this.getY();
			LT.clickDragGap = 1;
		}
		maxX = window.innerWidth  - this.getWidth();
		maxY = window.innerHeight - this.getHeight();
		LT.dragX = Math.min(LT.dragX - LT.clickX, maxX);
		LT.dragY = Math.min(LT.dragY - LT.clickY, maxY);
		LT.dragX = Math.max(LT.dragX, 0);
		LT.dragY = Math.max(LT.dragY, LT.Panel.PAGEBAR_HEIGHT);
		this.setX(LT.dragX);
		this.setY(LT.dragY);
	},

	// Resize panel using the bottom-right handle.
	resizeBR: function () {
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX - this.getWidth();
			LT.clickY = LT.dragY - this.getHeight();
			LT.clickDragGap = 1;
		}
		LT.dragX = Math.max(LT.dragX - LT.clickX, LT.Panel.MIN_WIDTH);
		LT.dragY = Math.max(LT.dragY - LT.clickY, 0);
		var maxWidth  = window.innerWidth  - this.getX();
		var maxHeight = window.innerHeight - this.getY();
		this.setWidth(Math.min(LT.dragX, maxWidth));
		this.setHeight(Math.min(LT.dragY, maxHeight));
	},

	// Resize panel using the top-left handle.
	resizeTL: function () {
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX - this.getX();
			LT.clickY = LT.dragY - this.getY();
			LT.Panel.clickCornerX = LT.dragX + this.getWidth();
			LT.Panel.clickCornerY = LT.dragY + this.getHeight();
			LT.clickDragGap = 1;
		}
		LT.dragX = Math.max(LT.dragX, LT.clickX);
		LT.dragY = Math.max(LT.dragY, LT.clickY + LT.Panel.PAGEBAR_HEIGHT);
		LT.dragX = Math.min(LT.dragX, LT.Panel.clickCornerX - LT.Panel.MIN_WIDTH);
		LT.dragY = Math.min(LT.dragY, LT.Panel.clickCornerY);
		this.setX(LT.dragX - LT.clickX);
		this.setY(LT.dragY - LT.clickY);
		this.setWidth(LT.Panel.clickCornerX - LT.dragX);
		this.setHeight(LT.Panel.clickCornerY - LT.dragY);
	},

	// Resize panel using the top-right handle.
	resizeTR: function () {
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX;
			LT.clickY = LT.dragY;
			LT.clickH = this.getHeight();
			LT.clickW = this.getWidth();
			LT.clickT = this.getY();
			LT.clickDragGap = 1;
		}
		LT.dragY = Math.max(LT.dragY, LT.clickY - LT.clickT + LT.Panel.PAGEBAR_HEIGHT);
		LT.dragY = Math.min(LT.dragY, LT.clickY + LT.clickH);
		this.setHeight(LT.clickH + LT.clickY - LT.dragY);
		this.setY(LT.clickT - LT.clickY + LT.dragY);

		var newWidth = LT.clickW + (LT.dragX - LT.clickX);
		newWidth = Math.min(newWidth, window.innerWidth - this.getX());
		newWidth = Math.max(newWidth, LT.Panel.MIN_WIDTH);
		this.setWidth(newWidth);
	},
	
	// Resize panel using the bottom-left handle.
	resizeBL: function () {
		var panelY = parseInt(this.outside.style.top);
		if (LT.clickDragGap == 0) {
			LT.clickX = LT.dragX - this.getX();
			LT.clickY = LT.dragY;
			LT.clickH = this.getHeight();
			LT.Panel.clickCornerX = LT.dragX + this.getWidth();
			LT.clickDragGap = 1;
		}
		LT.dragX = Math.max(LT.dragX, LT.clickX);
		LT.dragX = Math.min(LT.dragX, LT.Panel.clickCornerX - LT.Panel.MIN_WIDTH);
		this.setX(LT.dragX - LT.clickX);
		this.setWidth(LT.Panel.clickCornerX - LT.dragX);

		LT.dragY = Math.max(LT.dragY, panelY + LT.Panel.PAGEBAR_HEIGHT);
		LT.dragY = Math.min(LT.dragY, window.innerHeight);
		this.setHeight(LT.clickH - LT.clickY + LT.dragY);
	},
	
	// Change the position and size of the panel
	setX: function (x) {$(this.outside).css({left: x + "px"});},
	setY: function (y) {$(this.outside).css({top:  y + "px"});},
	setWidth: function (w) {$(this.outside).css({width: w + "px"});},
	setHeight: function (h) {
		$(this.outside).css({height: h + "px"});
		// TODO: why is this 23 here?
		$(this.outside).find(".content").css({
			height: (h - $(this.outside).find(".tabBar").height() - 23) + "px"
		});
	},

	// Find the position and size of the panel
	getX: function () {return parseInt($(this.outside).css("left"));},
	getY: function () {return parseInt($(this.outside).css("top"));},
	getWidth: function () {return parseInt($(this.outside).css("width"));},
	getHeight: function () {return parseInt($(this.outside).css("height"));},

};

