LT.RESOLUTION = 62;
LT.FOG_IMAGE = 44;

LT.colorMaps = {};
LT.toggleFog = 0;
LT.dragging = 0;
LT.pieceMoving = false;

$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");
//	LT.hideMapTabs();

	// disable map panel button until a campaign is loaded
	LT.mapPanel.disable();

	// submit map creation form
	$("#createMap").click(function () {
		$.post("php/Map.create.php", LT.formValues("#mapCreator"), function (data) {
			LT.loadMap(data.id);
		});
	});

	// submit map settings form
	$("#applyMapChanges").click(function () {
		var args = LT.formValues("#mapEditor");
		args.map = LT.currentMap.id;
		// convert tilt selection into minimum and maximum angles
		var tilt = JSON.parse(args.tilt);
		args.min_tilt = tilt[0];
		args.max_tilt = tilt[1];
		delete args.tilt;
		// convert zoom from percentage to fraction
		args.min_zoom /= 100;
		args.max_zoom /= 100;
		// submit changes
		$.post("php/Map.settings.php", args, LT.refreshMap);
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
	LT.images = {};
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

}); // $(function () { // This anonymous function runs after the page loads.

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
		$("#mapList tr:not(.template)").remove();
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
			copy.find(".disown").click(function () {
				if (!confirm("Are you sure you want to disown "
					+ (theMap.name || "[unnamed map]")
					+ "? The map will be deleted if it has no other owners.")) return;
				if (LT.currentMap && theMap.id == LT.currentMap.id) LT.leaveMap();
				$.post("php/Map.deleteOwner.php", 
					{"map": theMap.id, "user": LT.currentUser.id}, LT.refreshMapList);
			});
			copy.appendTo("#mapList");
		});
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
					$("#mapEditor [name=name]").val(map.name);
					$("#mapEditor [name=type]").val(map.type);
					$("#mapEditor [name=columns]").val(map.columns);
					$("#mapEditor [name=rows]").val(map.rows);
					$("#mapEditor [name=min_rotate]").val(map.min_rotate);
					$("#mapEditor [name=max_rotate]").val(map.max_rotate);
					$("#mapEditor [name=tilt]").val("[" + map.min_tilt + "," + map.max_tilt + "]");
					$("#mapEditor [name=min_zoom]").val(Math.round(map.min_zoom * 100));
					$("#mapEditor [name=max_zoom]").val(Math.round(map.max_zoom * 100));
					$("#mapEditor [name=grid_thickness]").val(map.grid_thickness);
					$("#mapEditor [name=wall_thickness]").val(map.wall_thickness);
					$("#mapEditor [name=door_thickness]").val(map.door_thickness);
					$("#mapEditor [name=grid_color]").val(map.grid_color);
					$("#mapEditor [name=wall_color]").val(map.wall_color);
					$("#mapEditor [name=door_color]").val(map.door_color);
				}

				// TODO: repaint grid in case the color or thickness have changed.

				// update pieces and tiles if they have changed
				if (LT.currentMap.piece_changes < map.piece_changes) LT.loadPieces();
				if (LT.currentMap.tile_changes  < map.tile_changes)  LT.loadTiles();

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

		var height = LT.RESOLUTION, width = LT.RESOLUTION;
		if (map.type == "hex") width = Math.round(width * 1.5 / Math.sqrt(3));

		// empty and resize layers
		$("#tileLayer, #clickTileLayer, #clickWallLayer, #wallLayer, #fogLayer").empty();
		$("#map, #clickWallLayer, #clickTileLayer").css({
			"width": width * map.columns + "px",
			"height": height * map.rows + "px",
		});

		// TODO: update grid instead of recreating it each time?
		// Add a new grid to the wall layer
		var grid = new LT.Grid(map.columns, map.rows, width, height,
			map.grid_thickness, map.grid_color,
			map.wall_thickness, map.wall_color,
			map.door_thickness, map.door_color, map.type, $("#wallLayer")[0]);

		$.each(map.flags.split(""), function (i, flag) {
			var x = i % (map.columns + 1);
			var y = Math.floor(i / (map.columns + 1));
			var offset = map.type == "hex" ? 1 / 6 : 0;
			var stagger = map.type == "hex" ? (x % 2) * 0.5 : 0;
			var tileElement = null, fogElement = null;
			var tile = x == 0 || y == 0 ? 0 : map.tiles[(x - 1) + (y - 1) * map.columns];
			var fog = "1abcdefghijklmnopqrstuvwxyz".indexOf(flag) != -1 ? 1 : 0;

			// flag    0ABCDEFGHIJKLMNOPQRSTUVWXYZ1abcdefghijklmnopqrstuvwxyz
			// fog                                ***************************
			// S wall           *********                  *********
			// S door                    *********                  *********
			// E wall     ***      ***      ***      ***      ***      ***   
			// E door        ***      ***      ***      ***      ***      ***
			// SE wall    ***      ***      ***      ***      ***      ***   
			// SE door       ***      ***      ***      ***      ***      ***
			// NE wall  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
			// NE door   *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

			// create walls and doors
			var side = map.type == "hex" ? "se" : "e";
			if ("IJKLMNOPQijklmnopq".indexOf(flag) != -1) grid.wall(x, y, "s");
			if ("RSTUVWXYZrstuvwxyz".indexOf(flag) != -1) grid.door(x, y, "s");
			if ("CDELMNUVWcdelmnuvw".indexOf(flag) != -1) grid.wall(x, y, side);
			if ("FGHOPQXYZfghopqxyz".indexOf(flag) != -1) grid.door(x, y, side);
			if ("ADGJMPSVYadgjmpsvy".indexOf(flag) != -1) grid.wall(x, y, "ne");
			if ("BEHKNQTWZbehknqtwz".indexOf(flag) != -1) grid.door(x, y, "ne");

			// function to create click detectors for walls
			var createWallClickDetector = function (column, row, direction, l, t, w, h) {
				$("<div>").appendTo($("#clickWallLayer")).css({
					"left": width	* (column + l - 1) + "px",
					"top": height * (row + t - 1) + "px",
					"width": width * w + "px",
					"height": height * h + "px",
				}).click(function () {
					if (row > map.rows) row = 0; // wrap rows for bottom left staggered edges
					// TODO: depending on which tool is selected set newType to "door" or "clear"?
					var oldType = grid.getWall(column, row, direction);
					var newType = oldType == "wall" ? "door" : oldType == "door" ? "none" : "wall";
					grid.setWall(column, row, direction, newType);
					var args = {"map": map.id, "x": column - 1, "y": row - 1};
					args[direction] = newType;
					$.post("php/Map.tile.php", args);
				});
			};

			// create the wall click detectors now
			if (map.type == "square") {
				if (x > 0) createWallClickDetector(x, y, "s",  1/4,  3/4, 1/2, 1/2);
				if (y > 0) createWallClickDetector(x, y, "e",  3/4,  1/4, 1/2, 1/2);
			}
			if (map.type == "hex") {
				var ne = true, se = true;
				if (!stagger && y == 0) se = false; // top uphill stray edges
				if (y == 0) ne = false; // top downhill stray edges
				if (x == 0 && y == 1) ne = false; // top left stray edge
				if (x == map.columns && stagger && y == 0) se = false; // top right stray edge
				if (x > 0) createWallClickDetector(x, y, "s", 1/3, stagger + 3/4, 2/3, 1/2);
				if (se) createWallClickDetector(x, y, "se", 1, stagger + 1/2, 1/3, 1/2);
				if (ne) createWallClickDetector(x, y, "ne", 1, stagger,       1/3, 1/2);
				// wrap rows for bottom left staggered edges
				if (!stagger && y == map.rows && x != map.columns)
					createWallClickDetector(x, y + 1, "ne",  1,  stagger,       1/3, 1/2);
			}

			// function to create or update the fog or tile image element
			var updateImageElement = function (element, index, parent) {
				if (index <= 0) {
					if (element) element.remove();
					return null;
				}
				// TODO: new tile will not be in correct order until refresh
				if (element === null) element = $("<img>").appendTo(parent);

				var image = LT.images[index];
				var scaleX = height / image[map.type][0];
				var scaleY = width / image[map.type][1];
				return element.attr("src", "images/" + image.file).css({
					position: "absolute", // TODO: put this in style.css?
					left: Math.round((x - 0.5 + offset) * width) + "px",
					top: Math.round((y - 0.5 + stagger) * height) + "px",
					width:  Math.round(image.size[0] * scaleX) + "px",
					height: Math.round(image.size[1] * scaleY) + "px",
					marginLeft: -Math.round(image.center[0] * scaleX) + "px",
					marginTop:  -Math.round(image.center[1] * scaleY) + "px",
					zIndex: image.layer,
				});
			};

			// function called when clicking or dragging over the tile
			var updateTile = function () {
				var args = {"map": map.id, "x": x - 1, "y": y - 1};
				switch ($("#tools .swatch.selected").data("tool")) {
					case "tile":
						tile = args.tile = LT.tile;
						tileElement = updateImageElement(tileElement, tile, "#tileLayer");
						break;
					case "erase":
						tile = args.tile = 0;
						tileElement = updateImageElement(tileElement, tile, "#tileLayer");
						break;
					case "fog":
						fog = args.fog = LT.toggleFog;
						fogElement = updateImageElement(fogElement, fog ? LT.FOG_IMAGE : 0, "#fogLayer");
						break;
				}
				$.post("php/Map.tile.php", args);
			};

			// create tile and fog now unless this is the first row or column
			if (x > 0 && y > 0) {
				if (tile) tileElement = updateImageElement(null, tile, "#tileLayer");
				if (fog) fogElement = updateImageElement(null, LT.FOG_IMAGE, "#fogLayer");
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
		$("#pieceList tr:not(.template)").remove();
		$.each(data, function (i, piece) {
			var source = piece.image.url || "images/" + piece.image.file;
			var scale = piece.image.scale ? piece.image.scale / 100 : 1;
			var mirror = piece.image.view == "side" && piece.image.angle < 0;
			var angle = piece.image.angle || 0;
			if (piece.image.view == "side" || piece.image.view == "front") angle = 0;
			var style = {
				width:  piece.image.size[0] + "px",
				height: piece.image.size[1] + "px",
				left: piece.x * LT.RESOLUTION + "px",
				top:  piece.y * LT.RESOLUTION + "px",
				marginLeft: (-piece.image.center[0] - 1) + "px",
				marginTop:  (-piece.image.center[1] - 1) + "px",
			};
			if (mirror) style.transform = "scale(-1, 1)";
			if (angle) style.transform = "rotate(" + angle + "deg)";
			if (scale != 1) style.transform += "scale(" + scale + ")";

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
				// TODO: select linked character in character panel
				$("#clickPieceLayer > *").removeClass("selected");
				$("#pieceLayer > *").removeClass("selected");
				mover.addClass("selected");
				// piece info tab
				LT.mapPanel.showTab("piece info");
				LT.mapPanel.selectTab("piece info");
				// draw image and center point on canvas;
				var canvas = $("#pieceImage").off("click").click(function () {
					var x = LT.dragX - center[0] - $(this).offset().left;
					var y = LT.dragY - center[1] - $(this).offset().top;
					switch ($("#pieceImageMode").val()) {
						case "center": piece.image.center = [
							x + piece.image.center[0],
							y + piece.image.center[1]]; break;
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
				var center = [canvas.width * 0.5, canvas.height * 0.5];
				var offset = [
					center[0] - piece.image.center[0],
					center[1] - piece.image.center[1]];
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
				var paint = function (x, y) {
					var radius = LT.RESOLUTION / 2;
					context.clearRect(0, 0, canvas.width, canvas.height);
					// draw piece image
					context.save();
					context.translate(center[0], center[1]);
					if (mirror) context.scale(-1, 1);
					if (angle) context.rotate(Math.PI * angle / 180);
					if ($("#pieceImageMode").val() != "scale")
						context.scale(scale, scale);
					else if (isNaN(x) || isNaN(y)) {
						if (scale != 1) context.scale(scale, scale);
						$("#pieceImageDebug").text(Math.round(scale * 100) + "%");
					} else {
						var scale2 = Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)) / radius;
						context.scale(scale2, scale2)
						$("#pieceImageDebug").text(Math.round(scale2 * 100) + "%");
					}
					context.translate(-center[0], -center[1]);
					if (element[0].tagName == "CANVAS")
						context.drawImage(element[0], offset[0], offset[1]);
					else context.drawImage(image, offset[0], offset[1]);
					context.restore();
					// draw center, base, scale or facing control
					switch ($("#pieceImageMode").val()) {
						case "center":
							if (isNaN(x)) x = center[0];
							if (isNaN(y)) y = center[1];
							drawX(context, x, y, 3, 5, "white");
							drawX(context, x, y, 3, 1.5, "black");
							$("#pieceImageDebug").text([x, y].join(", ")); break;
						case "base":
							var columns = piece.image.base[0];
							var rows = piece.image.base[1];
							if (!isNaN(x)) columns = Math.max(1, Math.ceil(Math.abs((x - center[0]) / radius)));
							if (!isNaN(y)) rows = Math.max(1, Math.ceil(Math.abs((y - center[1]) / radius)));
							drawBase(context, center[0], center[1], columns, rows, LT.RESOLUTION, 4, "white");
							drawBase(context, center[0], center[1], columns, rows, LT.RESOLUTION, 1.2, "black");
							$("#pieceImageDebug").text([columns, rows].join(", ")); break;
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
							$("#pieceImageDebug").text(Math.round(scale2 * 100) + "%"); break;
*/
						case "facing":
							var a = piece.image.angle ? Math.PI * piece.image.angle / 180 : 0;
							if (!isNaN(x) && !isNaN(y))
								a = Math.atan2(x - center[0], -(y - center[1]));
							drawArrow(context, center[0], center[1], a, radius * 1.25, 0.5, 0.2, 0.1, 4, "white");
							drawArrow(context, center[0], center[1], a, radius * 1.25, 0.5, 0.2, 0.1, 1.5, "black");
							$("#pieceImageDebug").text(Math.round(180 * a / Math.PI) + String.fromCharCode(176)); break;
					}
				};
				paint();

				$("#pieceImage").off("mouseout").on("mouseout", paint).off("mousemove").on("mousemove", function () {
					paint(
						LT.dragX - $(this).offset().left,
						LT.dragY - $(this).offset().top);
				});
				$("#pieceImageMode").off("change").change(paint);
				$("#pieceName").text(piece.name || "[unnamed piece]");
				$("#renamePiece").off("click").click(function () {
					var newName = prompt("new piece name", piece.name || "");
					if (newName != null && newName != piece.name) {
						piece.name = newName;
						$("#pieceName").text(piece.name || "[unnamed piece]");
						LT.savePieceSettings(piece);
					}
				});
				$("#deletePiece").off("click").click(deletePiece);
				$("#pieceColor").val(piece.color).off("change").change(function () {
					piece.color = $(this).val();
					LT.savePieceSettings(piece);
				});
				$("#pieceDepth").val(piece.image.z || 0).off("change").change(function () {
					piece.image.z = $(this).val();
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
				// TODO: character selector

			}; // var select = function () {

			// visual piece element
			var image = new Image();
			image.src = source;
			image.onload = function () {
				if (piece.image.palette) {
					// convert image into canvas
					var canvas = $("<canvas>").appendTo("#pieceLayer").attr({
						width: piece.image.size[0],
						height: piece.image.size[1],
					}).css(style).css("z-index", piece.image.z || 0);
					var context = canvas[0].getContext("2d");
					context.drawImage(image, 0, 0);
					element = canvas;
					if (piece.image.z) element.css("z-index", piece.image.z);
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
				}
				// show piece to piece info tab.
				if (piece.id == selectedPiece) select();
			};
			var element = $("<div>").appendTo("#pieceLayer").append(
				$("<div>").css({
					"width": "100%",
					"height": "100%",
					"background-image": "url(" + source + ")",
					"background-repeat": "no-repeat",
					"background-size": "contain",
				})
			).css(style).css("z-index", piece.image.z || 0);

			// clickable piece element
			var mover = $("<div>").attr("title", piece.name).mousedown(function () {
				LT.pieceElement = element;
				LT.pieceMover = mover;
				LT.pieceMoving = true;
				select();
				return false;
			}).mouseover(function () {
				element.addClass("selected");
				return false;
			}).mouseout(function () {
				element.removeClass("selected");
				return false;
			}).appendTo("#clickPieceLayer").css(style);

			// piece list
			var copy = $("#pieceList .template").clone().removeClass("template");
			copy.find(".link").click(function () {
				window.scrollTo( // scroll map to center on piece
					element.offset().left - window.innerWidth / 2,
					element.offset().top - window.innerHeight / 2);
				select();
				return false;
			});
			copy.find(".inlineImage").attr("src", source);
			copy.find(".name").text(piece.name || "");
			copy.find(".column").text(Math.round(piece.x));
			copy.find(".row").text(Math.round(piece.y));
			copy.find("input[value=delete]").click(deletePiece);
			copy.appendTo("#pieceList");

		}); // $.each(data, function (i, piece) {
	}); // $.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
}; // LT.loadPieces = function () {

/*
<div class="statRow">
	<span class="statName"></span>
	<input type="text" name="value" size="1"/>
	<div class="buttonDiv">-</div>
</div>
*/
LT.readStats = function () {
//	LT.Piece.statEditor.form.style.display = "block";
	$(".statRow").remove();
	$.each(LT.pieceSelected.getStats(), function (i, stat) {
		$("<div>").addClass("statRow").insertBefore($("#submitStats")).append([
			$("<span>").addClass("statName").text(stat.name + ": "),
			$("<input>").attr({type: "text", name: "value", size: "1"}).text(stat.value),
			$("<div>").addClass("buttonDiv").text("-").click(function () {
				LT.pieceSelected.deleteStat(stat.name);
				LT.readStats();
			}),
		]);
	});
};
LT.updateStats = function () {
	$.each(LT.pieceSelected.getStats(), function (i, stat) {
		LT.pieceSelected.setStat(stat.name, stat.valueInput.value);
	});
	LT.readStats();
};
LT.addStat = function () {
	LT.pieceSelected.setStat(LT.Piece.statEditor.newStatName.value,
		LT.Piece.statEditor.newStatValue.value);
	LT.readStats();
};


