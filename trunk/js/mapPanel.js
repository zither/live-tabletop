LT.RESOLUTION = 72;
LT.FOG_IMAGE = 44;

LT.toggleFog = 0;
LT.dragging = 0;
LT.dropHandlers.push(function () {LT.dragging = 0;});

$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");
	LT.hideMapTabs();

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

	// tools
	$("#eraser").click(function () {
		LT.selectedImageID = -1;
		LT.selectedImage = "";
		LT.chooseTool(this, "tile", "#clickTileLayer");
	});
	$("#fogTool").click(function () {
		LT.chooseTool(this, "fog", "#clickTileLayer");
	});
	$("#wallTool").click(function () {
		LT.chooseTool(this, "wall", "#clickWallLayer");
	});
	$("#pieceTool").click(function () {
		LT.chooseTool(this, "piece", "#clickPieceLayer");
	});
	LT.chooseTool($("#wallTool"), "wall", "#clickWallLayer"); // default tool

	// pieces

	$("#submitStats").click(function () {LT.Piece.updateStats();});
	$("#applyPieceChanges").click(function () {LT.Piece.selected.edit();});
	$("#deletePiece").click(function () {
		// TODO: what about unnamed peices?
		if (confirm("Are you sure you want to delete "
			+ LT.Piece.selected.name + "?")) LT.Piece.selected.remove({});
	});
	$("#createPiece").click(function () {LT.createPiece();});
	$("#addStat").click(function () {LT.Piece.addStat();});
});

LT.hideMapTabs = function () {
	LT.mapPanel.hideTab("map info");
	LT.mapPanel.hideTab("map tools");
	LT.mapPanel.hideTab("piece menu");
	LT.mapPanel.hideTab("piece list");
	LT.mapPanel.hideTab("piece info");
};

LT.showMapTabs = function () {
	LT.mapPanel.showTab("map info");
	LT.mapPanel.showTab("map tools");
	LT.mapPanel.showTab("piece menu");
	LT.mapPanel.showTab("piece list");
	LT.mapPanel.showTab("piece info");
};

LT.chooseTool = function (swatch, name, layer) {
	// select this tool icon
	$(".swatch").removeClass("selected");
	$(swatch).addClass("selected");
	// set the tool type for click handlers
	LT.brush = name;
	// activate the hidden clickable element layer
	$(".clickLayer").hide();
	$(layer).show();
};

LT.loadMap = function (id) {
	if (LT.currentMap && LT.currentMap.id == id) return;
	if (!LT.currentCampaign) alert("Cannot load a map outside a campaign.");
	else $.post("php/Campaign.map.php", {
		campaign: LT.currentCampaign.id,
		map: id
	}, function () {
		LT.showMapTabs(); // show tabs that only apply when a map is loaded
		LT.mapPanel.selectTab("map info");
//		LT.setCookie("map", id); // remember the current map when you reload
		// create default map object; tile_changes -1 forces loading new map tiles
		LT.currentMap = {"id": id, "piece_changes": -1, "tile_changes": -1};
		LT.refreshMap(); // start periodic map updates
	});
};

LT.leaveMap = function () {
	// hide map panel tabs that only apply when a map is loaded
	LT.hideMapTabs();
	$("#tileLayer, #clickTileLayer, #clickWallLayer, #wallLayer, #fogLayer").empty();
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
					$("#mapEditor [name=background]").val(map.background);
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

				// update map background
				// TODO: what is the structure of the background object?
				$("#map").css({background: "url('images/" + map.background + "')"});

				// TODO: repaint grid in case the color or thickness have changed.

				// update pieces if they have changed
				if (LT.currentMap.piece_changes < map.piece_changes) {
					$.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
						$("#pieceLayer").empty();
						$("#clickPieceLayer").empty();
						LT.pieces = [];
						for (var i = 0; i < data.length; i++)
							LT.pieces.push(new LT.Piece(data[i]));
					});
				}

				// update tiles if they have changed
				if (LT.currentMap.tile_changes < map.tile_changes) LT.loadTiles();

				LT.currentMap = map;

			}); // $.get("php/Map.changes.php", {map: LT.currentMap.id}, function (map) {

			// load map owners
			$.get("php/Map.owners.php", {map: LT.currentMap.id}, function (owners) {
				var currentUserCanEditThisMap = false;
				$.each(owners, function (i, owner) {
					// TODO: do you also need campaign ownership?
					if (owner.id == LT.currentUser.id)
						currentUserCanEditThisMap = true;
					// TODO: populate map owner list
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
			var updateImageElement = function (element, index) {
				if (index == 0) {element.hide(); return;}
				var image = LT.images[index];
				var scaleX = height / image[map.type][0];
				var scaleY = width / image[map.type][1];
				element.show().attr("src", "images/" + image.file).css({
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
				if (LT.brush == "tile") {
					tile = args.tile = LT.selectedImageID;
					updateImageElement(tileElement, tile);
				} else if (LT.brush == "fog") {
					fog = args.fog = LT.toggleFog;
					fogElement.toggle(fog == 1);
				} else return; // brush is not fog or tile?
				$.post("php/Map.tile.php", args);
			};

			// create tile and fog now unless this is the first row or column
			if (x > 0 && y > 0) {
				// create tile image
				var tileElement = $("<img>").appendTo("#tileLayer");
				updateImageElement(tileElement, tile);
				// create fog image
				var fogElement = $("<img>").appendTo("#fogLayer");
				updateImageElement(fogElement, LT.FOG_IMAGE);
				fogElement.toggle(fog == 1);
				// create tile click and drag detector
				$("<div>").appendTo("#clickTileLayer").css({
					"left": width * (x - 1 + offset) + "px",
					"top": height * (y - 1 + stagger) + "px",
					"width": width + "px",
					"height": height + "px",
				}).mousedown(function () { // click
					LT.dragging = 1;
					if (LT.brush == "fog") LT.toggleFog = 1 - fog;
					updateTile();
				}).mouseover(function () { // drag
					if (LT.dragging) updateTile();
				});
			}

		}); // $.each(map.flags.split(""), function (i, flag) {

	}); // $.get("php/Map.read.php", {map: LT.currentMap.id}, function (data) {
};

// Populate image selectors in the create piece and piece settings tabs
// (called for each piece image after loading piece image data in Piece.js)
LT.createPieceImageSwatch = function (image) {
	// Create an image for the create piece tab
	$("<img>").appendTo($("#pieceCreatorImages")).addClass("swatch").attr({
		title: image.file,
		src: "images/piece/" + image.file
	}).click(function () {
		var pieceWidth = parseInt($("#pieceCreator [name=width]").val());
		var pieceHeight = parseInt($("#pieceCreator [name=height]").val());
		$("#pieceCreator [name=x_offset]").val((image.width - pieceWidth) / -2);
		$("#pieceCreator [name=y_offset]").val((image.height - pieceHeight) * -1);
		$("#pieceCreator [name=name]").val(image.file.slice(0, -4)); // i.e. .jpg
		$("#pieceCreator [name=image_id]").val(image.id);
		$("#pieceCreatorImages *").removeClass("selected");
		$(this).addClass("selected");
	});
	// Create an image for the piece settings tab
	$("<img>").appendTo($("#pieceEditorImages")).addClass("swatch").attr({
		title: image.file,
		src: "images/piece/" + image.file,
	}).click(function () {
		$("#pieceEditor [name=image_id]").val(image.id);
		$("#pieceEditor [name=x_offset]").val((image.width - LT.Piece.selected.width) / -2);
		$("#pieceEditor [name=y_offset]").val((image.height - LT.Piece.selected.height) * -1);
		$("#pieceEditorImages *").removeClass("selected");
		$(this).addClass("selected");
	});
};

LT.createPiece = function () {
	var args = LT.formValues("#pieceCreator");
	args.map = LT.currentMap.id;
	if (args.image_id == "") {
		alert("Cannot create piece. No piece image selected.");
		return;
	}
	$.post("php/create_piece.php", args, function () {LT.refreshMap();});
};

/*
<div class="statRow">
	<span class="statName"></span>
	<input type="text" name="value" size="1"/>
	<div class="buttonDiv">-</div>
</div>
*/
LT.Piece.readStats = function () {
//	LT.Piece.statEditor.form.style.display = "block";
	$(".statRow").remove();
	LT.Piece.stats = LT.Piece.selected.getStats();
	for (var i = 0; i < LT.Piece.stats.length; i++)
		LT.Piece.createStatEditor(LT.Piece.stats[i]);
};
LT.Piece.createStatEditor = function (stat) {
	$("<div>").addClass("statRow").insertBefore($("#submitStats")).append([
		$("<span>").addClass("statName").text(stat.name + ": "),
		$("<input>").attr({type: "text", name: "value", size: "1"}).text(stat.value),
		$("<div>").addClass("buttonDiv").text("-").click(function () {
			LT.Piece.selected.deleteStat(statName);
			LT.Piece.readStats();
		}),
	]);
};
LT.Piece.updateStats = function () {
	for (var i = 0; i < LT.Piece.stats.length; i++)
		LT.Piece.selected.setStat(LT.Piece.stats[i].name,
			LT.Piece.stats[i].valueInput.value);
	LT.Piece.readStats();
};
LT.Piece.addStat = function () {
	LT.Piece.selected.setStat(LT.Piece.statEditor.newStatName.value,
		LT.Piece.statEditor.newStatValue.value);
	LT.Piece.readStats();
};


