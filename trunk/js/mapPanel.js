LT.RESOLUTION = 62;
LT.FOG_IMAGE = 44;
LT.FOG_HEX = 140;
LT.FOG_SQUARE = 64;
LT.GUTTERS = 32;
LT.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

LT.images = {};
LT.colorMaps = {};
LT.toggleFog = 0;
LT.dragging = 0;
LT.pieceMoving = false;

LT.rotate = 0;
LT.tilt = 90;
LT.zoom = 1;

$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");
	LT.mapPanel.resize = function () {
		var width = LT.mapPanel.getWidth();
		$("#mapName").css("max-width", width - $("#renameMap").width() - LT.GUTTERS + "px");
		$(".mapListRow").width(width - $(".disownMap:visible").width() - LT.GUTTERS);
		$(".pieceListRow").width(width - $(".pieceDelete:visible").width() - LT.GUTTERS);
		$("#pieceName").css("max-width", width - $("#renamePiece").width() - LT.GUTTERS + "px");
		$("#pieceCharacter").css("max-width", width - $("#deletePiece").width() - LT.GUTTERS - 2 + "px");
		$("#pieceURL").width(width - $("#changePieceURL").width() - LT.GUTTERS);
		$("#pieceCanvas")[0].width = width - $("#pieceCanvasMode").width() - LT.GUTTERS;
		$("#pieceCanvas")[0].width -= $("#pieceCanvas")[0].width % 2; // even number
		if (LT.repaintPieceCanvas) LT.repaintPieceCanvas();
	};

	// disable map panel button until a campaign is loaded
	LT.mapPanel.disable();

	// create grid
	LT.grid = new LT.Grid(1, 1, LT.RESOLUTION, LT.RESOLUTION,
		0, "black", 3, "black", 3, "white", "square", $("#wallLayer")[0]);

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
		}, LT.refreshMap);
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

	// load images
	$.get("images/images.json", function (data) {

		// read pieces
		$.each(data.pieces, function (name, group) {
			$.each(group, function (i, image) {
				LT.images[image.id] = image;
				// create an image for the new piece tab
				$("<img>").appendTo($("#pieceCreatorImages")).addClass("swatch").attr({
					title: image.file,
					src: "images/" + image.file
				}).click(function () {
					// TODO: place new piece at the center of the screen
					$.post("php/Piece.create.php", {
						"map": LT.currentMap.id,
						"image": JSON.stringify(image)
					}, LT.refreshMap);
				});
				// create an image for the piece info tab
				$("<img>").appendTo($("#pieceEditorImages")).addClass("swatch").attr({
					title: image.file,
					src: "images/" + image.file,
				}).click(function () {
					LT.pieceSelected.image = $.extend({}, image);
					LT.savePieceSettings(LT.pieceSelected);
					$("#pieceEditorImages *").removeClass("selected");
					$(this).addClass("selected");
				});
			});
		});

		// read tiles
		$.each(data.tiles, function (name, group) {
			$.each(group, function (i, image) {
				LT.images[image.id] = image;
				$("<img>").appendTo("#toolOptions [data-tool=tile]").attr({
					title: image.file,
					src: "images/" + image.file,
				}).addClass("swatch").click(function () {
					$("#toolOptions [data-tool=tile] .swatch").removeClass("selected");
					$(this).addClass("selected");
					LT.tile = image.id;
				});
			});
		});
		$("#toolOptions [data-tool=tile] .swatch:first-child").click();

	}); // $.get("images/images.json", function (data) {

	var PALETTES = {
		"wesnoth": [     [ 63,   0,  22],  [ 85,   0,  42],  [105,   0,  57],
		[123,   0,  69], [140,   0,  81],  [158,   0,  93],  [177,   0, 105],
		[195,   0, 116], [214,   0, 127],  [236,   0, 140],  [238,  61, 150],
		[239,  91, 161], [241, 114, 172],  [242, 135, 182],  [244, 154, 193],
		[246, 173, 205], [248, 193, 217],  [250, 213, 229],  [253, 233, 241]]};
	var COLORS = [
		{"name": "black",  "hue":   0, "saturation": 0.0, "luminosity": 0.1},
		{"name": "white",  "hue":   0, "saturation": 0.0, "luminosity": 0.9},
		{"name": "gray",   "hue":   0, "saturation": 0.0, "luminosity": 0.5},
		{"name": "brown",  "hue":  30, "saturation": 0.5, "luminosity": 0.3},
		{"name": "pink",   "hue":   0, "saturation": 1.0, "luminosity": 0.8},
		{"name": "red",    "hue":   0, "saturation": 1.0, "luminosity": 0.4},
		{"name": "orange", "hue":  30, "saturation": 1.0, "luminosity": 0.5},
		{"name": "yellow", "hue":  60, "saturation": 1.0, "luminosity": 0.5},
		{"name": "green",  "hue": 120, "saturation": 1.0, "luminosity": 0.3},
		{"name": "blue",   "hue": 240, "saturation": 1.0, "luminosity": 0.5},
		{"name": "purple", "hue": 280, "saturation": 1.0, "luminosity": 0.4}];
	$.each(PALETTES, function (name, palette) {
		LT.colorMaps[name] = {};
		$.each(COLORS, function (colorIndex, color) {
			LT.colorMaps[name][color.name] = {};
			$.each(palette, function (paletteIndex, rgb) {
				var h, s, l, c; // hue, saturation, luminosity, output RGB channels
				h = color.hue / 360;
				s = color.saturation;
				// blend half the colors to black and the other half to white
				var blend = 2 * (paletteIndex + 1) / palette.length;
				if (blend < 1) l = color.luminosity * blend;
				else l = color.luminosity * (2 - blend) + (blend - 1);
				// convert HSL to RGB
				if (s == 0) {
					l = Math.round(l * 255);
					c = [l, l, l];
				} else {
					var t1 = l < 0.5 ? l * (1 + s) : l + s - l * s;
					var t2 = 2 * l - t1;
					c = [(h + 1/3) % 1, h, (h + 2/3) % 1];
					$.each(c, function (i, x) {
						if (x * 6 < 1) c[i] = t2 + (t1 - t2) * 6 * x;
						else if (x * 2 < 1) c[i] = t1;
						else if (x * 3 < 2) c[i] = t2 + (t1 - t2) * (2/3 - x) * 6;
						else c[i] = t2;
						c[i] = Math.round (c[i] * 255);
					});
				}
				LT.colorMaps[name][color.name][rgb[0] * 65536 + rgb[1] * 256 + rgb[2]] = c;
			}); // $.each(palette, function (paletteIndex, rgb) {
		}); // $.each(COLORS, function (colorIndex, color) {
	}); // $.each(PALETTES, function (name, palette) {

	LT.dropHandlers.push(function () {
		LT.dragging = 0;
		if (LT.pieceMoving) {
			LT.pieceMoving = false;
			// TODO: freeze piece movement until map refreshes?
			// TODO: freeze map piece refreshes while moving pieces?
			$.post("php/Piece.move.php", {
				"piece": LT.pieceSelected.id,
				"x": LT.pieceElement.position().left / LT.RESOLUTION,
				"y": LT.pieceElement.position().top  / LT.RESOLUTION,
			}, LT.refreshMap);
		}
	});
	LT.dragHandlers.push(function () {
		if (LT.pieceMoving) {
			if (LT.clickDragGap == 0) {
				LT.clickX = LT.dragX - LT.pieceElement.position().left;
				LT.clickY = LT.dragY - LT.pieceElement.position().top;
				LT.clickDragGap = 1;
			}
			var x = Math.max(0, Math.min(LT.dragX - LT.clickX, $("#map").width()));
			var y = Math.max(0, Math.min(LT.dragY - LT.clickY, $("#map").height()));
	/*

			// TODO: snap settings
			// snap to centers of tiles
			x = LT.RESOLUTION * (Math.floor(x / LT.RESOLUTION) + 0.5);
			y = LT.RESOLUTION * (Math.floor(y / LT.RESOLUTION) + 0.5);

	*/
			LT.pieceElement.css({left: x + "px", top: y + "px"});

			LT.pieceMover.css({left: x + "px", top: y + "px"});
		}
	});

	// map rotate, tilt and zoom controls
	$("#zoomOut").click(function () {
		LT.zoom = Math.max(LT.zoom / 2 , LT.currentMap.min_zoom);
		LT.transform();
	});
	$("#zoomIn").click(function () {
		LT.zoom = Math.min(LT.zoom * 2, LT.currentMap.max_zoom);
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

}); // $(function () { // This anonymous function runs after the page loads.

// apply map rotation, tilt and zoom
LT.transform = function () {
	var stretch = Math.sin(Math.PI * LT.tilt / 180);
	$("#map").css("transform", "scale(" + LT.zoom + ","
		+ LT.zoom * stretch + ") rotate(" + LT.rotate + "deg)");
	$("#map .flat").css("transform", "rotate(" + -LT.rotate + "deg)");
	$("#map .front, #map .side").css("transform",
		"rotate(" + -LT.rotate + "deg) scaleY(" + 1 / stretch + ")");
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

LT.refreshMapList = function () {
	$.post("php/User.maps.php", function (theData) {
		var list = $(".content[data-tab='map list']");
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

				// update pieces and tiles if they have changed
				if (LT.currentMap.piece_changes < map.piece_changes) LT.loadPieces();
				if (LT.currentMap.tile_changes  < map.tile_changes)  LT.loadTiles();
				else if (LT.updateGrid(map)) LT.grid.repaint();

				LT.currentMap = map;

			}); // $.get("php/Map.changes.php", {map: LT.currentMap.id}, function (map) {

			// load map owners
			$.get("php/Map.owners.php", {map: LT.currentMap.id}, function (owners) {
				var currentUserCanEditThisMap = false;
				$("#mapOwners tr:not(.template)").remove();
				$.each(owners, function (i, owner) {
					var copy = $("#mapOwners .template").clone().removeClass("template");
					copy.find(".name").text(owner.name || owner.email);
					copy.find("input[value=remove]").click(function () {
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
		LT.refreshMapTimeout = setTimeout(LT.refreshMap, 10000);
	} // if (LT.currentUser && LT.currentMap) { // stop updating if no map is loaded
}

LT.loadTiles = function () {
	$.get("php/Map.read.php", {map: LT.currentMap.id}, function (map) {

		// TODO: loading a map is really slow, investigate why

		var height = LT.RESOLUTION;
		var width = LT.RESOLUTION;
		if (map.type == "hex") width = Math.round(width * 1.5 / Math.sqrt(3));

		// empty and resize layers
		$("#tileLayer, #clickTileLayer, #clickWallLayer, #fogLayer").empty();
		$("#map, #clickWallLayer, #clickTileLayer").css({
			"width": width * map.columns + "px",
			"height": height * map.rows + "px",
		});

		// create walls and doors
		LT.updateGrid(map);
		LT.grid.reset();
		$.each(map.walls.split(""), function (i, code) {
			var x = i % (map.columns + 2);
			var y = Math.floor(i / (map.columns + 2));
			var side = map.type == "hex" ? "se" : "e";
			var walls = LT.BASE64.indexOf(code);
			// TODO: change magic numbers to constants
			if ((walls & 3) == 1) LT.grid.wall(x, y, side);
			if ((walls & 3) == 2) LT.grid.door(x, y, side);
			if ((walls & 3) == 3) LT.grid.open(x, y, side);
			if ((walls & 12) == 4) LT.grid.wall(x, y, "s");
			if ((walls & 12) == 8) LT.grid.door(x, y, "s");
			if ((walls & 12) == 12) LT.grid.open(x, y, "s");
			if ((walls & 48) == 16) LT.grid.wall(x, y, "sw");
			if ((walls & 48) == 32) LT.grid.door(x, y, "sw");
			if ((walls & 48) == 48) LT.grid.open(x, y, "sw");
			// function to create click detectors for walls
			var createWallClickDetector = function (x, y, side, l, t, w, h) {
				$("<div>").appendTo($("#clickWallLayer")).css({
					"left": width	* (x + l - 1) + "px",
					"top": height * (y + t - 1) + "px",
					"width": width * w + "px",
					"height": height * h + "px",
				}).click(function () {
					// TODO: set type based on tool options?
					var type = LT.grid.getWall(x, y, side);
					if (type == "none") type = "wall";
					else if (type == "wall") type = "door";
					else if (type == "door") type = "open";
					else type = "none";
					LT.grid.setWall(x, y, side, type);
					$.post("php/Map.wall.php", {
						"map": map.id, "x": x, "y": y, "side": side, "type": type
					}, LT.refreshMap);
				});
			};
			// create the wall click detectors now
			if (map.type == "square") {
				if (x > 0) createWallClickDetector(x, y, "s",  1/6,  5/6, 2/3, 1/3);
				if (y > 0) createWallClickDetector(x, y, "e",  5/6,  1/6, 1/3, 2/3);
			}
			if (map.type == "hex") {
				var stagger = (1 - x % 2) * 0.5;
				if (x > 0 && x <= map.columns) // no south walls on side columns
					createWallClickDetector(x, y, "s", 1/3, stagger + 5/6, 2/3, 1/3);
				if (!(y == 0 && x % 2)) { // no sw, se sides on staggered top tiles
					// no se sides on right column, bottom-left corner or...
					if (x <= map.columns && !(x == 0 && y == map.rows)
						&& !(x == map.columns && y == 0)) // top 2nd-from-right tile
						createWallClickDetector(x, y, "se", 1, stagger + 1/2, 1/3, 1/2);
					// no sw sides on left column or bottom-right non-staggered corner
					if (x > 0 && !(x > map.columns && y == map.rows && !(x % 2)))
						createWallClickDetector(x, y, "sw", 0, stagger + 1/2, 1/3, 1/2);
				}
			}
		});

		LT.grid.repaint();

		// tiles and fog
		$.each(map.tiles.match(/.{1,2}/g), function (i, code) {
			var x = i % map.columns;
			var y = Math.floor(i / map.columns);
			var offset = map.type == "hex" ? 1 / 6 : 0;
			var stagger = map.type == "hex" ? ((x + 1) % 2) * 0.5 : 0;
			var tileElement = null;
			var fogElement = null;
			var fogIndex = LT.BASE64.indexOf(map.fog[Math.floor(i / 6)]);
			var fog = Math.floor(fogIndex / Math.pow(2, 5 - i % 6)) % 2;
			var tile = LT.BASE64.indexOf(code[0]) * 64 + LT.BASE64.indexOf(code[1]);

			var style = function (image) {
				var scaleX = width / image[map.type][0];
				var scaleY = height / image[map.type][1];
				return {
					left: Math.round((x - 0.5 + offset) * width) + "px",
					top: Math.round((y - 0.5 + stagger) * height) + "px",
					width:  Math.round(image.size[0] * scaleX) + "px",
					height: Math.round(image.size[1] * scaleY) + "px",
					marginLeft: -Math.round(image.center[0] * scaleX) + "px",
					marginTop:  -Math.round(image.center[1] * scaleY) + "px",
					zIndex: image.layer,
				};
			};

			// function to create or update the tile image element
			var updateTileElement = function () {
				if (tile > 0) {
					// TODO: new tile will not be in correct order until refresh
					if (tileElement === null) tileElement = $("<img>").appendTo("#tileLayer");
					var image = LT.images[tile];
					tileElement.attr("src", "images/" + image.file).css(style(image));
				} else {
					if (tileElement) tileElement.remove();
					tileElement = null;
				}
			};

			// function to create or update the fog image element
			var updateFogElement = function () {
				if (fog) {
					if (fogElement === null) fogElement = $("<img>").appendTo("#fogLayer");
					var byWall = false;
					var directions = ["n", "ne", "se", "s", "sw", "nw"];
					if (map.type == "square") directions = ["n", "e", "s", "w"];
					$.each(directions, function (i, direction) {
						var wallType = LT.grid.getWall(x + 1, y + 1, direction);
						if (wallType == "wall" || wallType == "door") byWall = true;
					});
					var image = LT.images[LT.FOG_SQUARE];
					if (map.type == "hex") image = LT.images[LT.FOG_HEX];
					if (!byWall) image = LT.images[LT.FOG_IMAGE];
					fogElement.attr("src", "images/" + image.file).css(style(image)).css("z-index", 0);
				} else {
					if (fogElement) fogElement.remove();
					fogElement = null;
				}
			};

			// function called when clicking or dragging over the tile
			var updateTile = function () {
				switch ($("#tools .swatch.selected").data("tool")) {
					case "tile":
						tile = LT.tile;
						$.post("php/Map.tile.php", {"map": map.id, "x": x, "y": y, "tile": tile});
						updateTileElement();
						break;
					case "erase":
						tile = 0;
						$.post("php/Map.tile.php", {"map": map.id, "x": x, "y": y, "tile": tile});
						updateTileElement();
						break;
					case "fog":
						fog = LT.toggleFog;
						$.post("php/Map.fog.php", {"map": map.id, "x": x, "y": y, "fog": fog});
						updateFogElement();
						break;
				}
			};

			// create tile and fog now unless this is the first row or column
			if (x > 0 && y > 0) {
				updateTileElement();
				updateFogElement();
				$("<div>").appendTo("#clickTileLayer").css({
					"left": width * (x - 1 + offset) + "px",
					"top": height * (y - 1 + stagger) + "px",
					"width": width + "px",
					"height": height + "px",
				}).mousedown(function () { // click
					LT.dragging = 1;
					LT.toggleFog = 1 - fog; // TODO: make sure this doesn't do anything bad to the tile or erase tool
					updateTile();
				}).mouseover(function () { // drag
					if (LT.dragging) updateTile();
				});
			}

		}); // $.each(map.flags.split(""), function (i, flag) {

	}); // $.get("php/Map.read.php", {map: LT.currentMap.id}, function (data) {
}; // LT.loadTiles = function () {

LT.updateGrid = function (map) {
	var changed = false;
	if (map.columns != LT.grid.getColumns())
		{LT.grid.setColumns(map.columns); changed = true;}
	if (map.rows != LT.grid.getRows())
		{LT.grid.setRows(map.rows); changed = true;}
	if (map.type != LT.grid.getType()) {
		if (map.type == "hex")
			LT.grid.setWidth(Math.round(LT.RESOLUTION * 1.5 / Math.sqrt(3)));
		else LT.grid.setWidth(LT.RESOLUTION);
		LT.grid.setType(map.type);
		changed = true;
	}
	if (map.grid_thickness != LT.grid.getThickness())
		{LT.grid.setThickness(map.grid_thickness); changed = true;}
	if (map.grid_color != LT.grid.getColor())
		{LT.grid.setColor(map.grid_color); changed = true;}
	if (map.wall_thickness != LT.grid.getWallThickness())
		{LT.grid.setWallThickness(map.wall_thickness); changed = true;}
	if (map.wall_color != LT.grid.getWallColor())
		{LT.grid.setWallColor(map.wall_color); changed = true;}
	if (map.door_thickness != LT.grid.getDoorThickness())
		{LT.grid.setDoorThickness(map.door_thickness); changed = true;}
	if (map.door_color != LT.grid.getDoorColor())
		{LT.grid.setDoorColor(map.door_color); changed = true;}
	return changed;
};

LT.savePieceSettings = function (piece) {
	$.post("php/Piece.settings.php", {
		"piece": piece.id,
		"image": JSON.stringify(piece.image),
		"name": piece.name || "",
		"character": piece.character,
		"locked": piece.locked,
		"markers": JSON.stringify(piece.markers),
		"color": piece.color,
	}, LT.refreshMap);
};

LT.loadPieces = function () {
	$.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
		var selectedPiece = LT.getCookie("piece");
		$("#pieceLayer, #clickPieceLayer").empty();
		$("#pieceList div:not(.template)").remove();
		$.each(data, function (i, piece) {
			var source = piece.image.url || "images/" + piece.image.file;
			var scale = piece.image.scale ? piece.image.scale / 100 : 1;
			var mirror = piece.image.view == "side" && piece.image.angle < 0;
			var angle = piece.image.angle || 0;
			if (piece.image.view == "side" || piece.image.view == "front") angle = 0;
			var style = {
				width:  piece.image.size[0] * scale + "px",
				height: piece.image.size[1] * scale + "px",
				left: piece.x * LT.RESOLUTION + "px",
				top:  piece.y * LT.RESOLUTION + "px",
				marginLeft: (-piece.image.center[0] * scale - 1) + "px",
				marginTop:  (-piece.image.center[1] * scale - 1) + "px",
			};


			var deletePiece = function () {
				var name = "this piece"
				if (piece.name) name = "the piece named " + piece.name;
				if (confirm("Are you sure you want to delete " + name + "?"))
					$.post("php/Piece.delete.php", {piece: piece.id}, LT.refreshMap);
			};

			// select piece when you click on the piece on the map or list
			var select = function () {
				LT.pieceSelected = piece;
				// remember selected piece when you refresh the pieces
				LT.setCookie("piece", piece.id);
				// piece info tab
				LT.mapPanel.showTab("piece info");
				// TODO: select linked character in character panel
				$("#clickPieceLayer > *").removeClass("selected");
				$("#pieceLayer > *").removeClass("selected");
				mover.addClass("selected");
				// draw image and center point on canvas;
				var canvas = $("#pieceCanvas").off("click").click(function () {
					var center = [canvas.width * 0.5, canvas.height * 0.5];
					var x = LT.dragX - center[0] - $(this).offset().left;
					var y = LT.dragY - center[1] - $(this).offset().top;
					switch ($("#pieceCanvasMode").val()) {
						case "center": piece.image.center = [
							piece.image.center[0] + x * (mirror ? -1 : 1),
							piece.image.center[1] + y]; break;
						case "base": piece.image.base = [
							Math.max(1, Math.ceil(Math.abs(2 * x / LT.RESOLUTION))),
							Math.max(1, Math.ceil(Math.abs(2 * y / LT.RESOLUTION)))]; break;
						case "scale": piece.image.scale =
							Math.round(200 * Math.sqrt(x * x + y * y) / LT.RESOLUTION); break;
						case "facing": piece.image.angle =
							Math.round(Math.atan2(x, -y) * 180 / Math.PI); break;
					}
					LT.savePieceSettings(piece);
				})[0];
				var context = canvas.getContext("2d");
				var drawX = function (context, x, y, length, thickness, color) {
					context.lineCap = "round";
					context.strokeStyle = color;
					context.lineWidth = thickness;
					context.beginPath();
					context.moveTo(x - length, y - length);
					context.lineTo(x + length, y + length);
					context.moveTo(x - length, y + length);
					context.lineTo(x + length, y - length);
					context.stroke();					
				};
				var drawBase = function (context, x, y, columns, rows, scale, thickness, color) {
					context.lineCap = "round";
					context.strokeStyle = color;
					context.lineWidth = thickness;
					context.beginPath();
					var left = x - scale * columns / 2;
					var right = x + scale * columns / 2;
					var top = y - scale * rows / 2;
					var bottom = y + scale * rows / 2;
					for (var row = 0; row <= rows; row++) {
						context.moveTo(left, top + row * scale);
						context.lineTo(right, top + row * scale);
					}
					for (var column = 0; column <= columns; column++) {
						context.moveTo(left + column * scale, top);
						context.lineTo(left + column * scale, bottom);
					}
					context.stroke();					
				};
				var drawScale = function (context, x, y, radius, thickness, color) {
					context.lineCap = "round";
					context.strokeStyle = color;
					context.lineWidth = thickness;
					context.beginPath();
					context.arc(x, y, radius, 0, 2 * Math.PI);
					context.stroke();					
				};
				var drawArrow = function (context, x, y, angle, length, tail, head, barb, thickness, color) {
					context.lineCap = "round";
					context.strokeStyle = color;
					context.lineWidth = thickness;
					context.save();
					context.translate(x, y);
					context.rotate(angle);
					context.beginPath();
					context.moveTo(0, -length * tail);
					context.lineTo(0, -length);
					context.moveTo(0, -length);
					context.lineTo(length * barb, -length * (1 - head));
					context.moveTo(0, -length);
					context.lineTo(-length * barb, -length * (1 - head));
					context.stroke();
					context.restore();
				};
				LT.repaintPieceCanvas = function (x, y) {
					if (!LT.pieceSelected) return;
					var radius = LT.RESOLUTION / 2;
					var center = [canvas.width * 0.5, canvas.height * 0.5];
					var offset = [
						center[0] - piece.image.center[0],
						center[1] - piece.image.center[1]];
					context.clearRect(0, 0, canvas.width, canvas.height);
					// draw piece image
					context.save();
					context.translate(center[0], center[1]);
					if (mirror) context.scale(-1, 1);
					if (angle) context.rotate(Math.PI * angle / 180);
					if ($("#pieceCanvasMode").val() != "scale")
						context.scale(scale, scale);
					else if (isNaN(x) || isNaN(y)) {
						if (scale != 1) context.scale(scale, scale);
						$("#pieceCanvasText").text(Math.round(scale * 100) + "%");
					} else {
						var scale2 = Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)) / radius;
						context.scale(scale2, scale2)
						$("#pieceCanvasText").text(Math.round(scale2 * 100) + "%");
					}
					context.translate(offset[0], offset[1]);
					context.translate(-center[0], -center[1]);
					if (piece.image.url) {
						var scale3 = Math.min(
							piece.image.size[0] / image.width,
							piece.image.size[1] / image.height);
						context.scale(scale3, scale3);
					}
					var pic = element[0].tagName == "CANVAS" ? element[0] : image;
					context.drawImage(pic, 0, 0);
					context.restore();
					// draw center, base, scale or facing control
					switch ($("#pieceCanvasMode").val()) {
						case "center":
							if (isNaN(x)) x = center[0];
							if (isNaN(y)) y = center[1];
							drawX(context, x, y, 3, 5, "white");
							drawX(context, x, y, 3, 1.5, "black");
							// TODO: scaled and rotated images
							x = piece.image.center[0] + (x - center[0]) * (mirror ? -1 : 1);
							y = piece.image.center[1] + (y - center[1]);
							$("#pieceCanvasText").text([x, y].join(", ")); break;
						case "base":
							var w = piece.image.base[0];
							var h = piece.image.base[1];
							if (!isNaN(x))
								w = Math.max(1, Math.ceil(Math.abs((x - center[0]) / radius)));
							if (!isNaN(y))
								h = Math.max(1, Math.ceil(Math.abs((y - center[1]) / radius)));
							drawBase(context, center[0], center[1], w, h, LT.RESOLUTION, 4, "white");
							drawBase(context, center[0], center[1], w, h, LT.RESOLUTION, 1.2, "black");
							$("#pieceCanvasText").text([w, h].join(", ")); break;
/*
						case "scale":
							drawScale(context, center[0], center[1], radius * scale, 4, "white");
							drawScale(context, center[0], center[1], radius * scale, 1.5, "black");
							var scale2 = scale;
							if (!isNaN(x) && !isNaN(y)) {
								scale2 = Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)) / radius;
								drawScale(context, center[0], center[1], radius * scale2, 4, "white");
								drawScale(context, center[0], center[1], radius * scale2, 1.5, "black");
							}
							$("#pieceCanvasText").text(Math.round(scale2 * 100) + "%"); break;
*/
						case "facing":
							var a = piece.image.angle ? Math.PI * piece.image.angle / 180 : 0;
							if (!isNaN(x) && !isNaN(y))
								a = Math.atan2(x - center[0], -(y - center[1]));
							drawArrow(context, center[0], center[1], a, radius * 1.25, 0.5, 0.2, 0.1, 4, "white");
							drawArrow(context, center[0], center[1], a, radius * 1.25, 0.5, 0.2, 0.1, 1.5, "black");
							$("#pieceCanvasText").text(Math.round(180 * a / Math.PI) + String.fromCharCode(176)); break;
					}
				};
				LT.repaintPieceCanvas();

				$("#pieceCanvas").off("mousemove").on("mousemove", function () {
					LT.repaintPieceCanvas(
						LT.dragX - $(this).offset().left,
						LT.dragY - $(this).offset().top);
				}).off("mouseout").on("mouseout", LT.repaintPieceCanvas);
				$("#pieceCanvasMode").off("change").change(LT.repaintPieceCanvas);
				$("#pieceName").text(piece.name || "[unnamed piece]");
				$("#renamePiece").off("click").click(function () {
					var newName = prompt("new piece name", piece.name || "");
					if (newName != null && newName != piece.name) {
						piece.name = newName;
						$("#pieceName").text(piece.name || "[unnamed piece]");
						LT.savePieceSettings(piece);
					}
				});

				// TODO: character selector

				$("#deletePiece").off("click").click(deletePiece);
				$("#pieceView").val(piece.image.view || "top").off("change").change(function () {
					piece.image.view = $(this).val();
					LT.savePieceSettings(piece);
				});
				$("#pieceDepth").val(piece.image.z || 0).off("change").change(function () {
					piece.image.z = $(this).val();
					LT.savePieceSettings(piece);
				});
				$("#pieceBase").val(piece.image.baseType || "none").off("change").change(function () {
					piece.image.baseType = $(this).val();
					if (piece.image.baseType == "none") delete piece.image.baseType;
					LT.savePieceSettings(piece);
				});
				$("#pieceColor").val(piece.color).off("change").change(function () {
					piece.color = $(this).val();
					LT.savePieceSettings(piece);
				});
				$("#pieceURL").text(piece.image.url || "");
				$("#changePieceURL").off("click").click(function () {
					var url = prompt("new external image URL", piece.image.url || "");
					if (url != null && url != piece.image.url) {
						piece.image = {
							"url": url,
							"view": "top",
							"size": [LT.RESOLUTION, LT.RESOLUTION],
							"center": [LT.RESOLUTION / 2, LT.RESOLUTION / 2],
							"base": [1, 1],
						};
						$("#pieceURL").text(piece.image.url || "");
						LT.savePieceSettings(piece);
					}
				});

				// TODO: angle should not be tied to image

			}; // var select = function () {

			// visual piece element
			var transform = "";
			if (mirror) transform += "scaleX(-1)";
			if (angle) transform += "rotate(" + angle + "deg)";
			var image = new Image();
			image.src = source;
			image.onload = function () {
				if (piece.image.palette) {
					// convert image into canvas
					var canvas = $("<canvas>")[0];
					canvas.width = piece.image.size[0];
					canvas.height = piece.image.size[1];
					var context = canvas.getContext("2d");
					context.drawImage(image, 0, 0);
					// remap colors
					var map = LT.colorMaps[piece.image.palette][piece.color];
					var buffer = context.getImageData(0, 0, piece.image.size[0], piece.image.size[1]);
					var bytes = buffer.data;
					for (var n = 0; n < bytes.length; n += 4) {
						if (bytes[n + 3] == 0) continue; // ignore transparent pixels
						var key = bytes[n] * 65536 + bytes[n + 1] * 256 + bytes[n + 2];
						if (key in map) {
							var rgb = map[key];
							bytes[n] = rgb[0];
							bytes[n + 1] = rgb[1];
							bytes[n + 2] = rgb[2];
						}
					}
					context.putImageData(buffer, 0, 0);
					// replace contents of visual piece element with canvas
					element.empty().append($(canvas).css("transform", transform))
						.css(style).css("z-index", piece.image.z || 0).addClass(piece.image.view);
				}
				// show piece in piece info tab.
				if (piece.id == selectedPiece) select();
			};
			var element = $("<div>").appendTo("#pieceLayer").append(
				$("<div>").css({
					"width": "100%",
					"height": "100%",
					"background-image": "url(" + source + ")",
					"background-repeat": "no-repeat",
					"background-size": "contain",
					"transform": transform,
				})
			).css(style).css("z-index", piece.image.z || 0).addClass(piece.image.view);

			// clickable piece element
			var mover = $("<div>").attr("title", piece.name).mousedown(function () {
				LT.pieceElement = element;
				LT.pieceMover = mover;
				LT.pieceMoving = true;
				select();
				LT.mapPanel.selectTab("piece info");
				return false;
			}).mouseover(function () {
				element.addClass("selected");
				return false;
			}).mouseout(function () {
				element.removeClass("selected");
				return false;
			}).appendTo("#clickPieceLayer").css(style).addClass(piece.image.view);

			// piece list
			var copy = $("#pieceList .template").clone().removeClass("template");
			copy.find(".link").click(function () {
				window.scrollTo( // scroll map to center on piece
					element.offset().left - window.innerWidth / 2,
					element.offset().top - window.innerHeight / 2);
				select();
				LT.mapPanel.selectTab("piece info");
				return false;
			});
			copy.find(".inlineImage").attr("src", source);
			copy.find(".name").text(piece.name || "");
			copy.find(".column").text(Math.round(piece.x));
			copy.find(".row").text(Math.round(piece.y));
			copy.find("input[value=delete]").click(deletePiece);
			copy.appendTo("#pieceList");

		}); // $.each(data, function (i, piece) {

		LT.mapPanel.resize();
		LT.transform();

	}); // $.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
}; // LT.loadPieces = function () {



