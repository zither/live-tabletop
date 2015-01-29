$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");

	// refresh map list
	// TODO: automatically refresh this list as needed (user timestamps?) 
	$("#refreshMaps").click(function () {LT.refreshMaps();});

	// submit map settings form
	$("#applyMapChanges").click(function () {
		LT.currentMap.update(LT.formValues("#mapEditor")).done(function () {
			LT.loadMap(LT.currentMap);
		});
	});

	// submit map creation form
	$("#createMap").click(function () {
		$.post("php/Map.create.php", LT.formValues("#mapCreator"), function (data) {
			LT.loadMap(new LT.Map(data[0]));
		});
	});

	// TODO: UI for choosing presets
	// TODO: does the new design need presets?
	$.get("presets.json", function (data) {LT.Map.presets = data;});

	// tools tab
	$("#toolsTab").click(function () {
		LT.chooseTool("#pieceTool", "piece", "#clickPieceLayer");
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

LT.chooseTool = function (swatch, name, layer) {
	// select this tool icon
	$(".toolsTab .swatch").removeClass("selected");
	$(swatch).addClass("selected");
	// set the tool type for click handlers
	LT.brush = name;
	// activate the hidden clickable element layer
	$(".clickLayer").hide();
	$(layer).show();
};

LT.loadMap = function (map) {
	LT.currentMap = map;
	LT.setCookie("map", map.id);
	// FIXME: maps can have multiple owners
	// TODO: do you also need campaign ownership?
	if (map.user_id == LT.currentUser.id) {
		// show tabs only visible to owners
		LT.mapPanel.showTab("piece list");
		LT.mapPanel.showTab("piece info");
		LT.mapPanel.showTab("map info");
		LT.mapPanel.showTab("map tools");
	} else {
		// hide tabs only visible to owners
		LT.mapPanel.hideTab("piece list");
		LT.mapPanel.hideTab("piece info");
		LT.mapPanel.hideTab("map info");
		LT.mapPanel.hideTab("map tools");
		LT.mapPanel.selectTab("map list");
		$(".clickLayer").hide();
		$("#clickPieceLayer").show();
	}

	LT.refreshMaps(); // TODO: should we do this here?

	map.createGrid();
	map.loadTiles();
	LT.loadPieces();

	// load background image
	// FIXME: new background system
	if (map.image_id != -1)
		$("#map").css({background: "url('images/upload/background/"
			+ LT.Map.images[map.image_id].file + "')"});

	// populate map info form
	$("#mapEditor [name=name]").val(map.name);
	$("#mapEditor [name=type]").val(map.type);
	$("#mapEditor [name=background]").val(map.background);
	$("#mapEditor [name=columns]").val(map.tile_columns);
	$("#mapEditor [name=rows]").val(map.tile_rows);
	$("#mapEditor [name=grid_thickness]").val(map.grid_thickness);
	$("#mapEditor [name=wall_thickness]").val(map.wall_thickness);
	$("#mapEditor [name=door_thickness]").val(map.door_thickness);
	$("#mapEditor [name=grid_color]").val(map.grid_color);
	$("#mapEditor [name=wall_color]").val(map.wall_color);
	$("#mapEditor [name=door_color]").val(map.door_color);

	// start periodic map updates
	LT.updateMap();
};

LT.refreshMapList = function () {
	$.get("php/User.maps.php", function (data) {
		// TODO: replace rows of maps table
		$("#mapList tr:not(.template)").remove();
		$.each(data, function (i, map) {
			var row = $("#mapList .template").clone().removeClass("template");
			row.find(".name").text(map.name).click(function () {
				$.get("php/Map.read.php", {"map": map.id}, function (theData) {
					LT.loadMap(new LT.Map(theData));
				});
			});
			row.find(".columns").text(map.columns);
			row.find(".rows").text(map.rows);
			row.find(".type").text(map.type);
 			row.find(".disown").click(function () {
				$.post("php/Map.deleteOwner.php",
					{"user": LT.currentUser.id, "map": map.id},
					function () {LT.refreshMapList();});
			});
			row.appendTo("#mapList tbody");
		});
	});
};

LT.refreshMaps = function () {
	$.post("php/User.maps.php", function (theData) {
		var list = $(".content[data-tab='map list']");
		list.find(".mapRow:not(.template)").remove();
		$.each(theData, function (i, theMap) {
			var row = list.find(".mapRow.template").clone().removeClass("template").appendTo(list);
			row.find(".load").text(theMap.name)
				.click(function () {LT.loadMap(new LT.Map(theMap));});
			row.find(".info").text(theMap.columns + " &times; " + theMap.rows);
			row.find(".disown").click(function () {
				if (confirm("Are you sure you want to disown "
					+ (theMap.name === null || theMap.name == "" ? "this map" : theMap.name)
					+ "? The map will be deleted if it has no other owners.")) {
					if (theMap.id == LT.currentMap.id) LT.unloadMap();
					$.post("php/Map.disown.php", {"map": theMap.id}, LT.refreshMaps);
				}
			});
		});
	}, "json");
};

LT.updateMap = function () {
	if (LT.currentUser && LT.currentMap) {
		if (!LT.holdTimestamps) {
			$.post("php/Map.changes.php", {map: LT.currentMap.id}, function (data) {
				var map = new LT.Map(data);

				// TODO: update map name (string)
				// TODO: update map type ("square" or "hex")
				// TODO: update map rows
				// TODO: update map columns
				// TODO: update map background
				// TODO: update map min_zoom
				// TODO: update map max_zoom
				// TODO: update map min_rotate
				// TODO: update map max_rotate
				// TODO: update map min_tilt
				// TODO: update map max_tilt
				// TODO: update map grid_thickness
				// TODO: update map grid_color
				// TODO: update map wall_thickness
				// TODO: update map wall_color
				// TODO: update map door_thickness
				// TODO: update map door_color

				// update pieces if they have changed
				if (LT.currentMap.piece_changes < map.piece_changes) {
					LT.loadPieces();
				}

				// update tiles if they have changed
				if (LT.currentMap.tile_changes < map.tile_changes) {
					LT.currentMap.loadTiles();
				}

				LT.currentMap = map;

			}, "json");
		}
		setTimeout(LT.updateMap, 2000);
	}
}


// Populate image selectors in the create piece and piece settings tabs
// (called for each piece image after loading piece image data in Piece.js)
LT.createPieceImageSwatch = function (image) {
	// Create an image for the create piece tab
	$("<img>").appendTo($("#pieceCreatorImages")).addClass("swatch").attr({
		title: image.file,
		src: "images/upload/piece/" + image.file
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
		src: "images/upload/piece/" + image.file,
	}).click(function () {
		$("#pieceEditor [name=image_id]").val(image.id);
		$("#pieceEditor [name=x_offset]").val((image.width - LT.Piece.selected.width) / -2);
		$("#pieceEditor [name=y_offset]").val((image.height - LT.Piece.selected.height) * -1);
		$("#pieceEditorImages *").removeClass("selected");
		$(this).addClass("selected");
	});
};

LT.loadPieces = function () {
	$("#pieceLayer").empty();
	$("#clickPieceLayer").empty();
	$.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
		LT.pieces = [];
		for (var i = 0; i < data.length; i++)
			LT.pieces.push(new LT.Piece(data[i]));
	}, "json");
};

LT.createPiece = function () {
	var args = LT.formValues("#pieceCreator");
	args.map = LT.currentMap.id;
	if (args.image_id == "") {
		alert("Cannot create piece. No piece image selected.");
		return;
	}
	$.post("php/create_piece.php", args, function () {LT.loadPieces();});
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

