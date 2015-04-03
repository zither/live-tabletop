LT.HEIGHT = 48;
LT.WIDTH = 48; // sometimes 42. A variable constant? You know that's right!
LT.HEX_WIDTH = 42;
LT.SQUARE_WIDTH = 48;
LT.TOP = 24;
LT.LEFT = 24; // sometimes 28. A variable constant? You know that's right!
LT.HEX_LEFT = 28;
LT.SQUARE_LEFT = 24;
LT.GUTTERS = 32;
LT.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

LT.dragging = 0;
LT.cursorRequested = false;

LT.rotate = 0;
LT.tilt = 90;
LT.zoom = 1;
LT.center = [0, 0];

$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");
	LT.mapPanel.resize = function () {
		var width = LT.mapPanel.getWidth();
		switch (LT.mapPanel.getTab()) {
			case "map list":
				$("#mapName").css("max-width", width - $("#renameMap").width() - LT.GUTTERS + "px");
				$(".mapListRow").width(width - $(".disownMap:visible").width() - LT.GUTTERS);
				break;
			case "map info":
				$("#mapOwner").css("max-width", width - $("#mapShare").width() - LT.GUTTERS - 2 + "px");
				$(".mapOwnerName").width(width - $(".mapOwnerRemove:visible").width() - LT.GUTTERS);
				break;
			case "map tools":
				break;
			case "piece list":
				$(".pieceListRow").width(width - $(".pieceDelete:visible").width() - LT.GUTTERS);
				break;
			case "piece info":
				$("#pieceName").css("max-width", width - $("#renamePiece").width() - LT.GUTTERS + "px");
				$("#pieceCharacter").css("max-width", width - $("#deletePiece").width() - LT.GUTTERS - 2 + "px");
				$("#pieceURL").width(width - $("#changePieceURL").width() - LT.GUTTERS);
				$("#pieceCanvas")[0].width = width - $("#pieceCanvasMode").width() - LT.GUTTERS;
				$("#pieceCanvas")[0].width -= $("#pieceCanvas")[0].width % 2; // even number
				if (LT.repaintPieceCanvas) LT.repaintPieceCanvas();
				break;
		}
	};

	// disable map panel button until a campaign is loaded
	LT.mapPanel.disable();

	// submit map creation form
	$("#createMap").click(function () {
		$.post("php/Map.create.php", LT.formValues("#mapCreator"), function (data) {
			LT.loadMap(data.id);
		});
	});

	// map info form
	var saveMapSettings = function () {
		$.post("php/Map.settings.php", {
			"map": LT.currentMap.id,
			"name": LT.currentMap.name,
			"type": LT.currentMap.type,
			"min_zoom": LT.currentMap.min_zoom,
			"max_zoom": LT.currentMap.max_zoom,
			"min_rotate": LT.currentMap.min_rotate,
			"max_rotate": LT.currentMap.max_rotate,
			"min_tilt": LT.currentMap.min_tilt,
			"max_tilt": LT.currentMap.max_tilt,
			"grid_thickness": LT.currentMap.grid_thickness,
			"grid_color": LT.currentMap.grid_color,
			"wall_thickness": LT.currentMap.wall_thickness,
			"wall_color": LT.currentMap.wall_color,
			"door_thickness": LT.currentMap.door_thickness,
			"door_color": LT.currentMap.door_color,
		}, function () {
			LT.refreshMap();
			LT.paintGrid();
		});
	};
	$("#renameMap").click(function () {
		var newName = prompt("new map name", LT.currentMap.name || "");
		if (newName != null && newName != LT.currentMap.name) {
			LT.currentMap.name = newName;
			saveMapSettings();
		}
	});
	$("#mapType").change(function () {
		LT.currentMap.type = $(this).val();
		saveMapSettings();
	});
	var resize = function (left, top, right, bottom) {
		$.post("php/Map.size.php", {
			"map": LT.currentMap.id,
			"left": left,
			"top": top,
			"right": LT.currentMap.columns + right,
			"bottom": LT.currentMap.rows + bottom,
			"tile": 0,
			"flags": "0",
		}, LT.refreshMap);		
	};
	$.each([-10, -1, 1, 10], function (i, n) {
		$("#resizeMapLeft input")[i].click(function () {resize(n, 0, 0, 0);});
		$("#resizeMapTop input")[i].click(function () {resize(0, n, 0, 0);});
		$("#resizeMapRight input")[i].click(function () {resize(0, 0, n, 0);});
		$("#resizeMapBottom input")[i].click(function () {resize(0, 0, 0, n);});
	});
	$("#grid_thickness").change(function () {
		LT.currentMap.grid_thickness = parseInt($(this).val());
		saveMapSettings();
	});
	$("#grid_color").change(function () {
		LT.currentMap.grid_color = $(this).val();
		saveMapSettings();
	});
	$("#wall_thickness").change(function () {
		LT.currentMap.wall_thickness = parseInt($(this).val());
		saveMapSettings();
	});
	$("#wall_color").change(function () {
		LT.currentMap.wall_color = $(this).val();
		saveMapSettings();
	});
	$("#door_thickness").change(function () {
		LT.currentMap.door_thickness = parseInt($(this).val());
		saveMapSettings();
	});
	$("#door_color").change(function () {
		LT.currentMap.door_color = $(this).val();
		saveMapSettings();
	});
	$("#min_zoom").change(function () {
		LT.currentMap.min_zoom = parseInt($(this).val()) / 100; // percentage
		saveMapSettings();
	});
	$("#max_zoom").change(function () {
		LT.currentMap.max_zoom = parseInt($(this).val()) / 100; // percentage
		saveMapSettings();
	});
	$("#min_rotate").change(function () {
		LT.currentMap.min_rotate = parseInt($(this).val());
		saveMapSettings();
	});
	$("#max_rotate").change(function () {
		LT.currentMap.max_rotate = parseInt($(this).val());
		saveMapSettings();
	});
	$("#mapTilt").change(function () {
		// convert tilt selection into minimum and maximum angles
		var tilt = JSON.parse($(this).val());
		LT.currentMap.min_tilt = tilt[0];
		LT.currentMap.max_tilt = tilt[1];
		saveMapSettings();
	});

	// close map
	$("#mapClose").click(function () {
		LT.leaveMap();
		$.post("php/Campaign.map.php", {campaign: LT.currentCampaign.id, map: 0});
	});

	// share map ownership
	$("#mapShare").click(function () {
		$.post("php/Map.share.php", {
			map: LT.currentMap.id,
			user: $("#mapOwner").val(),
		}, LT.refreshMap);
	});

	// tools
	$("#tools .swatch").click(function () {
		var tool = $(this).data("tool");
		// select the tool icon
		$("#tools .swatch").removeClass("selected");
		$(this).addClass("selected");
		// show the tool options
		$("#toolOptions > div").hide();
		$("#toolOptions > div[data-tool=" + tool + "]").show();
		// activate the hidden clickable element layer
		$(".clickLayer").hide();
		if (tool == "piece") $("#clickPieceLayer").show();
		else if (tool == "wall") $("#clickWallLayer").show();
	 	else $("#clickTileLayer").show();
	});
	$("#tools .swatch[data-tool=piece]").click(); // default tool

	// tile tool options
	$("#erase").change(function () {
		if (this.checked) $("#tilePalette *").removeClass("selected");
		else $("#tile" + LT.tile).addClass("selected");
	});

	// fog tool options
	$("#fogFill").click(function () {
		$.post("php/Map.fillFog.php", {"map": LT.currentMap.id}, LT.refreshMap);
	});
	$("#fogClear").click(function () {
		$.post("php/Map.clearFog.php", {"map": LT.currentMap.id}, LT.refreshMap);
	});

	// synchronize grid snap controls
	$("#snap, #snap2").change(function() {
		$("#snap, #snap2").prop("checked", this.checked);
	});

	// map rotate, tilt and zoom controls
	$("#zoomOut").click(function () {
		if (Math.log(LT.zoom) / Math.log(2) % 1) LT.zoom /= 4 / 3;
		else LT.zoom /= 3 / 2;
		LT.zoom = Math.max(LT.zoom, LT.currentMap.min_zoom);
		LT.transform();
	});
	$("#zoomIn").click(function () {
		if (Math.log(LT.zoom) / Math.log(2) % 1) LT.zoom *= 4 / 3;
		else LT.zoom *= 3 / 2;
		LT.zoom = Math.min(LT.zoom, LT.currentMap.max_zoom);
		LT.transform();
	});
	$("#rotateLeft").click(function () {
		if (LT.currentMap.max_rotate - LT.currentMap.min_rotate == 360)
			LT.rotate = (LT.rotate - 15 + 540) % 360 - 180;
		else LT.rotate = Math.max(LT.rotate - 15, LT.currentMap.min_rotate);
		LT.transform();
	});
	$("#rotateRight").click(function () {
		if (LT.currentMap.max_rotate - LT.currentMap.min_rotate == 360)
			LT.rotate = (LT.rotate + 15 + 540) % 360 - 180;
		else LT.rotate = Math.min(LT.rotate + 15, LT.currentMap.max_rotate);
		LT.transform();
	});
	$("#tiltDown").click(function () {
		LT.tilt = Math.max(LT.tilt - 15, LT.currentMap.min_tilt);
		LT.transform();
	});
	$("#tiltUp").click(function () {
		LT.tilt = Math.min(LT.tilt + 15, LT.currentMap.max_tilt);
		LT.transform();
	});

	LT.cursorMove(); // start showing cursor when user holds ctrl key

	$(window).resize(LT.centerMap);

}); // $(function () { // This anonymous function runs after the page loads.

// apply map rotation, tilt and zoom
LT.transform = function () {
	var stretch = Math.sin(Math.PI * LT.tilt / 180);
	$("#map").css("transform", "scale(" + LT.zoom + ","
		+ LT.zoom * stretch + ") rotate(" + LT.rotate + "deg)");
	$("#clickPieceLayer .flat, #pieceLayer .flat").css("transform", "rotate(" + -LT.rotate + "deg)");
	$("#clickPieceLayer .front, #pieceLayer .front, #clickPieceLayer .side, #pieceLayer .side").css("transform",
		"rotate(" + -LT.rotate + "deg) scaleY(" + 1 / stretch + ")");
	LT.sortPieces();
	LT.centerMap();
};

LT.hideMapTabs = function () {
	LT.mapPanel.hideTab("map info");
	LT.mapPanel.hideTab("map tools");
	LT.mapPanel.hideTab("piece list");
	LT.mapPanel.hideTab("piece info");
};

LT.showMapTabs = function () {
	LT.mapPanel.showTab("map info");
	LT.mapPanel.showTab("map tools");
	LT.mapPanel.showTab("piece list");
	LT.mapPanel.showTab("piece info");
};

LT.loadMap = function (id) {
	if (LT.currentMap && LT.currentMap.id == id) return;
	if (!LT.currentCampaign) alert("Cannot load a map outside a campaign.");
	else $.post("php/Campaign.map.php", {
		campaign: LT.currentCampaign.id,
		map: id
	}, function () {
//		LT.showMapTabs(); // show tabs that only apply when a map is loaded
		// create default map object; tile_changes -1 forces loading new map tiles
		LT.currentMap = {"id": id, "piece_changes": -1, "tile_changes": -1};
		LT.refreshMap(); // start periodic map updates
	});
};

LT.leaveMap = function () {
	LT.hideMapTabs();
	$(".mapLayer, .clickLayer").empty();
	$("#map, #clickWallLayer, #clickTileLayer").css({"width": 0, "height": 0});
	delete LT.currentMap;
};

// Update the map list if that tab is visible.
LT.refreshMapList = function () {
	if (LT.mapPanel.getTab() != "map list") return;
	$.post("php/User.maps.php", function (theData) {
		if (LT.mapPanel.getTab() != "map list") return;
		$("#mapListHelp").toggle(theData.length > 0);
		$("#mapList > div:not(.template)").remove();
		$.each(theData, function (i, theMap) {
			var copy = $("#mapList .template").clone().removeClass("template");
			copy.find(".name").text(theMap.name || "[unnamed map]").click(function () {
				LT.loadMap(theMap.id);
				LT.showMapTabs();
				LT.mapPanel.selectTab("map info");
			});
			copy.find(".columns").text(theMap.columns);
			copy.find(".rows").text(theMap.rows);
			copy.find(".type").text(theMap.type);
			copy.find(".disownMap").click(function () {
				if (!confirm("Are you sure you want to disown "
					+ (theMap.name || "[unnamed map]")
					+ "? The map will be deleted if it has no other owners.")) return;
				if (LT.currentMap && theMap.id == LT.currentMap.id) LT.leaveMap();
				$.post("php/Map.deleteOwner.php", 
					{"map": theMap.id, "user": LT.currentUser.id}, LT.refreshMapList);
			});
			copy.appendTo("#mapList");
		});
		LT.mapPanel.resize();
	}, "json");
};

LT.refreshMap = function () {
	// we only want one of these scheduled at a time
	if (LT.refreshMapTimeout) clearTimeout(LT.refreshMapTimeout);

	if (LT.currentUser && LT.currentMap) { // stop updating if no map is loaded
		if (!LT.holdTimestamps) { // do not update while dragging

			$.get("php/Map.changes.php", {map: LT.currentMap.id}, function (map) {

				// populate map info form
				// do this when loading a new map and while the map info tab is hidden
				if (!("name" in LT.currentMap) || LT.mapPanel.getTab() != "map info") {
					$("#mapName").text(map.name || "[unnamed map]");
					$("#mapType").val(map.type);
					$("#mapColumns").text(map.columns);
					$("#mapRows").text(map.rows);
					$("#grid_thickness").val(map.grid_thickness);
					$("#wall_thickness").val(map.wall_thickness);
					$("#door_thickness").val(map.door_thickness);
					$("#grid_color").val(map.grid_color);
					$("#wall_color").val(map.wall_color);
					$("#door_color").val(map.door_color);
					$("#min_zoom").val(Math.round(map.min_zoom * 100));
					$("#max_zoom").val(Math.round(map.max_zoom * 100));
					$("#min_rotate").val(map.min_rotate);
					$("#max_rotate").val(map.max_rotate);
					$("#mapTilt").val("[" + map.min_tilt + "," + map.max_tilt + "]");
				}

				// change the aspect column/row aspect ratio
				if (map.type == "hex") {
					LT.WIDTH = LT.HEX_WIDTH;
					LT.LEFT = LT.HEX_LEFT;
				} else {
					LT.WIDTH = LT.SQUARE_WIDTH;
					LT.LEFT = LT.SQUARE_LEFT;
				}
				$(".mapLayer .clickLayer").css({
					"left": LT.LEFT + "px",
					"top": LT.TOP + "px",
				});

				// FIXME: when the map type changes, the tiles and tile clickers need to move.

				// update pieces and tiles if they have changed
				if (LT.currentMap.piece_changes < map.piece_changes) LT.loadPieces();
				if (LT.currentMap.tile_changes  < map.tile_changes)  LT.loadTiles();
				else if (map.type != LT.currentMap.type
					|| map.rows != LT.currentMap.rows
					|| map.columns != LT.currentMap.columns
					|| map.grid_thickness != LT.currentMap.grid_thickness
					|| map.wall_thickness != LT.currentMap.wall_thickness
					|| map.door_thickness != LT.currentMap.door_thickness
					|| map.grid_color != LT.currentMap.grid_color
					|| map.wall_color != LT.currentMap.wall_color
					|| map.door_color != LT.currentMap.door_color) LT.paintGrid();

				// position map so there is room for rotation
				LT.centerMap();				

				LT.currentMap = map;

			}); // $.get("php/Map.changes.php", {map: LT.currentMap.id}, function (map) {

			// load map owners
			$.get("php/Map.owners.php", {map: LT.currentMap.id}, function (owners) {
				var currentUserCanEditThisMap = false;
				$("#mapOwners > :not(.template)").remove();
				$.each(owners, function (i, owner) {
					var copy = $("#mapOwners > .template").clone().removeClass("template");
					copy.find(".mapOwnerName").text(owner.name || owner.email);
					copy.find(".mapOwnerRemove").click(function () {
						$.post("php/Map.deleteOwner.php", {
							map: LT.currentMap.id,
							user: owner.id
						}, LT.refreshMap);
					});
					copy.appendTo("#mapOwners");
					// TODO: do you also need campaign ownership?
					if (owner.id == LT.currentUser.id)
						currentUserCanEditThisMap = true;
				});
				if (currentUserCanEditThisMap) {
					LT.showMapTabs(); // show tabs only visible to owners
				} else {
					LT.hideMapTabs(); // hide tabs only visible to owners
					LT.mapPanel.selectTab("map list");
					$(".clickLayer").hide();
					$("#clickPieceLayer").show();
				}
			});

		} // if (!LT.holdTimeStamps) { // do not update while dragging
		LT.refreshMapTimeout = setTimeout(LT.refreshMap, LT.DELAY);
	} // if (LT.currentUser && LT.currentMap) { // stop updating if no map is loaded
}

// cursor appears when you press ctrl or move the mouse while holding it
$(document).on("mousemove keydown", function (e) {
	if (e.ctrlKey) LT.cursorRequested = true;
});

// update cursor when mouse has moved
LT.cursorMove = function () {
	if (LT.cursorRequested && LT.currentUser && LT.currentCampaign && LT.currentMap) {
		var position = LT.screenToMap(LT.dragX, LT.dragY);
		$.post("php/User.cursor.php", {
			"campaign": LT.currentCampaign.id,
			"x": position[0],
			"y": position[1],
		});
	}
	LT.cursorRequested = false;
	setTimeout(LT.cursorMove, LT.DELAY);
};

// show users' cursors
LT.updateCursors = function (theUsers) {
	$("#cursors").empty();
	var duration = 60000; // fade out over 1 minute
	$.each(theUsers, function (i, user) {
		if (!user.cursor) return;
		var time = $.now() - 1000 * user.cursor.time;
		if (time < duration) {
			var cursor = $("<div>").appendTo("#cursors").css({
				"left": user.cursor.x * LT.WIDTH + "px",
				"top": user.cursor.y * LT.HEIGHT + "px",
				"background-color": user.color || "black",
			});
			var fade = function () {
				var time = $.now() - 1000 * user.cursor.time;
				if (time < duration && cursor.closest("html").length == 1) {
					cursor.css("opacity", (duration - time) / duration);
					setTimeout(fade, LT.DELAY);
				}
			};
			fade();
		}
	});
};

LT.mapToScreen = function (c, r) {
	var rows = LT.currentMap.rows;
	var columns = LT.currentMap.columns;
	if (LT.currentMap.type == "hex") {columns += 1/3; rows += 0.5;}
	c -= (columns - 1) / 2;
	r -= (rows - 1) / 2;
	var angle = Math.PI * LT.rotate / 180;
	var x = c * Math.cos(angle) - r * Math.sin(angle);
	var y = r * Math.cos(angle) + c * Math.sin(angle);
	x *= LT.zoom * LT.WIDTH;
	y *= LT.zoom * LT.HEIGHT * Math.sin(Math.PI * LT.tilt / 180);
	return [x + LT.center[0], y + LT.center[1]];
};

LT.screenToMap = function (x, y) {
	var rows = LT.currentMap.rows;
	var columns = LT.currentMap.columns;
	if (LT.currentMap.type == "hex") {columns += 1/3; rows += 0.5;}
	x = (x - LT.center[0]) / (LT.zoom * LT.WIDTH);
	y = (y - LT.center[1]) / (LT.zoom * LT.HEIGHT
		* Math.sin(Math.PI * LT.tilt / 180));
	var angle = -Math.PI * LT.rotate / 180;
	return [
		x * Math.cos(angle) - y * Math.sin(angle) + (columns - 1) / 2,
		y * Math.cos(angle) + x * Math.sin(angle) + (rows - 1) / 2];
};

LT.centerMap = function () {
	if (!LT.currentMap) return;
	var x = LT.WIDTH * (LT.currentMap.columns - 1);
	var y = LT.HEIGHT * (LT.currentMap.rows - 1);
	var r = LT.zoom * (Math.sqrt(x * x + y * y) + LT.WIDTH + LT.HEIGHT);
	var w = Math.max($(window).width(), r);
	var h = Math.max($(window).height(), r + 2 * $("#pageBar").height());
	LT.center[0] = w / 2;
	LT.center[1] = h / 2;
	$("#mapScrollSpace").css({"width": w + "px", "height": h + "px"});
	$("#map").css({
		"margin-left": -x / 2 + "px",
		"margin-top": -y / 2 + "px",
		"left": LT.center[0] + "px",
		"top": LT.center[1] + "px",
	});
};

/*
$(document).mousemove(function () {
	if (!LT.currentMap) return;
	var output = [LT.screenToMap(LT.dragX, LT.dragY)];
	output.push([LT.dragX, LT.dragY]);
	output.push(LT.mapToScreen(0, 0));
	output.push(LT.mapToScreen(1, 0));
	output.push(LT.mapToScreen(0, 1));
	output.push(LT.mapToScreen(1, 1));
	output.push([output[5][0] - output[2][0], output[5][1] - output[2][1]]);
	$("#debug").empty();
	$.each(output, function (i, n) {
		$("<div>").text([n[0].toFixed(1), n[1].toFixed(1)].join(", ")).appendTo("#debug");}
	);
});
/**/



