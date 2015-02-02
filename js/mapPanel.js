$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");
	LT.mapPanel.hideTab("map info");
	LT.mapPanel.hideTab("map tools");
	LT.mapPanel.hideTab("piece list");
	LT.mapPanel.hideTab("piece info");

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
		$.post("php/Map.settings.php", LT.formValues("#mapEditor"), LT.refreshMap);
	});

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

LT.loadMap = function (id) {
	var load = function () {
		// show map panel tabs that only apply when a map is loaded
		LT.mapPanel.showTab("map info");
		LT.mapPanel.showTab("map tools");
		LT.mapPanel.showTab("piece list");
		LT.mapPanel.showTab("piece info");
		LT.mapPanel.selectTab("map info");
		// remember the current map when you reload
		LT.setCookie("map", id);
		// create default map object
		LT.currentMap = {"id": id, "piece_changes": 0, "tile_changes": 0};
		// start periodic map updates
		LT.refreshMap();
	};
	// the campaign must be displaying this map to view it
	if (!LT.currentCampaign) alert("Cannot load a map outside a campaign.");
	else if (LT.currentCampaign.map != id)
		$.post("php/Campaign.map.php", {campaign: LT.currentCampaign.id, map: id}, load);
	else load();
};

LT.leaveMap = function () {
	// hide map panel tabs that only apply when a map is loaded
	LT.mapPanel.hideTab("map info");
	LT.mapPanel.hideTab("map tools");
	LT.mapPanel.hideTab("piece list");
	LT.mapPanel.hideTab("piece info");
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
				$("#mapEditor [name=name]").val(map.name);
				$("#mapEditor [name=type]").val(map.type);
				$("#mapEditor [name=background]").val(map.background);
				// TODO: what is the structure of the background object?
				$("#map").css({background: "url('images/upload/" + map.background + "')"});
				$("#mapEditor [name=columns]").val(map.columns);
				$("#mapEditor [name=rows]").val(map.rows);
				$("#mapEditor [name=min_rotate]").val(map.min_rotate);
				$("#mapEditor [name=max_rotate]").val(map.max_rotate);
				$("#mapEditor [name=min_tilt]").val(map.min_tilt);
				$("#mapEditor [name=max_tilt]").val(map.max_tilt);
				$("#mapEditor [name=min_zoom]").val(map.min_zoom);
				$("#mapEditor [name=max_zoom]").val(map.max_zoom);
				$("#mapEditor [name=grid_thickness]").val(map.grid_thickness);
				$("#mapEditor [name=wall_thickness]").val(map.wall_thickness);
				$("#mapEditor [name=door_thickness]").val(map.door_thickness);
				$("#mapEditor [name=grid_color]").val(map.grid_color);
				$("#mapEditor [name=wall_color]").val(map.wall_color);
				$("#mapEditor [name=door_color]").val(map.door_color);

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
				if (LT.currentMap.tile_changes < map.tile_changes) {
					// load tiles
//					LT.currentMap.loadTiles();
					// TODO: Map.read reads more than just tiles
					$.get("php/Map.read.php", {map: LT.currentMap.id}, function (data) {
						$("#tileLayer, #clickTileLayer, #fogLayer").empty();
						$("#map, #clickWallLayer").css({
							width: LT.TILE_WIDTH * data.tile_columns + "px",
							height: LT.TILE_HEIGHT * data.tile_rows + "px",
						});
						LT.tiles = [];
						$.each(data.images, function (i, image) {
							LT.tiles.push(new LT.Tile({
								x: i % data.tile_columns,
								y: Math.floor(i / data.tile_columns),
								image_id: image,
								fog: parseInt(data.fog[i]),
							}));
						});
					});
					LT.currentMap.createGrid();
				}

				LT.currentMap = map;
			});

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
			});

		} // if (!LT.holdTimeStamps) { // do not update while dragging
		LT.refreshMapTimeout = setTimeout(LT.refreshMap, 10000);
	} // if (LT.currentUser && LT.currentMap) { // stop updating if no map is loaded
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

LT.loadImages = function () {
	$.get("images/upload/images.json", function (data) {
		$.each(data.backgrounds, function (i, background) {
			$("#mapCreator select[name=background]").append($("<option>").text(background.file));
		});
		$.each(data.pieces, function (i, background) {
		});
		$.each(data.tiles, function (i, background) {
		});
	});
}

