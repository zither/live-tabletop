  /////////////////////////////////////////////////////////////////////////////
 // tablesPanel.js ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

$(function () { // This anonymous function runs after the page loads.
	LT.mapPanel = new LT.Panel("map");

	// refresh table list
	// TODO: automatically refresh this list as needed (user timestamps?) 
	$("#refreshTables").click(function () {LT.refreshTables();});

	// submit table settings form
	$("#applyTableChanges").click(function () {
		LT.currentTable.update(LT.formValues("#tableEditor")).done(function () {
			LT.loadTable(LT.currentTable);
		});
	});

	// submit table creation form
	$("#createTable").click(function () {
		$.post("php/create_table.php", LT.formValues("#tableCreator"), function (data) {
			LT.loadTable(new LT.Table(data[0]));
		});
	});

	// TODO: UI for choosing presets
	$.get("presets.json", function (data) {LT.Table.presets = data;});

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

LT.loadTable = function (table) {
	LT.currentTable = table;
	LT.setCookie("table", table.id);
	if (table.user_id == LT.currentUser.id 
		|| LT.currentUser.permissions == "administrator") {
		// show tabs only visible to table owner
		LT.piecesPanel.showTab("pieceCreationTab");
		LT.piecesPanel.showTab("pieceSettingsTab");
		LT.tablesPanel.showTab("tableSettingsTab");
		LT.tablesPanel.showTab("toolsTab");
	} else {
		// hide tabs only visible to table owner
		if ($("#tableSettingsTab").hasClass("active"))
			LT.tablesPanel.selectTab("tableListTab");
		LT.piecesPanel.hideTab("pieceCreationTab");
		LT.piecesPanel.hideTab("pieceSettingsTab");
		LT.tablesPanel.hideTab("tableSettingsTab");
		LT.tablesPanel.hideTab("toolsTab");
		$(".clickLayer").hide();
		$("#clickPieceLayer").show();
	}
	LT.refreshTables(); // TODO: should we do this here?

	// TODO: this might change when we refactor tables and notifications
	LT.alert();
	LT.alert("Loading chat log for " + table.name + "...");
	LT.lastMessageID = 0;
	LT.refreshChatPanel();
	LT.alert("Arriving at " + table.name);
	LT.alert();

	table.createGrid();
	table.loadTiles();
	LT.loadPieces();

	// create new pieces sized to fit this grid
	$("#pieceCreator [name=width]").val(table.tile_width);
	$("#pieceCreator [name=height]").val(table.tile_height);

	// load background image
	if (table.image_id != -1)
		$("#map").css({background: "url('images/upload/background/"
			+ LT.Table.images[table.image_id].file + "')"});

	// populate table settings form
	$("#tableEditor [name=name]").val(table.name);
	$("#tableEditor [name=tile_columns]").val(table.tile_columns);
	$("#tableEditor [name=tile_rows]").val(table.tile_rows);
	$("#tableEditor [name=tile_height]").val(table.tile_height);
	$("#tableEditor [name=tile_width]").val(table.tile_width);
	$("#tableEditor [name=grid_thickness]").val(table.grid_thickness);
	$("#tableEditor [name=wall_thickness]").val(table.wall_thickness);
	$("#tableEditor [name=image_id]").val(table.image_id);
	$("#tableEditor [name=tile_mode]").val(table.tile_mode);
};

LT.refreshTables = function () {
	$.post("php/read_tables.php", function (data) {		
//		// TODO: when is this used?
//		var tableID = parseInt(LT.getCookie("table"));
		$("#tableList").empty();
		for (var i = 0; i < data.length; i++) {
//			if (!LT.currentTable && data[i].id == tableID)
//				LT.currentTable = new Table(data[i]);
			// TODO: move CSS to style.css
			$("<div>").appendTo("#tableList").css({clear: "both"}).append([
				LT.loadTableButton(data[i]),
				LT.deleteTableButton(data[i]),
				$("<div>").addClass("separator"),
			]);
		}
	}, "json");
};
LT.loadTableButton = function (data) {
	return $("<a>").addClass("textButton").text(data.name).click(function () {
		LT.loadTable(new LT.Table(data));
	});
};
LT.deleteTableButton = function (data) {
	return $("<a>").addClass("deleteButton").text("Delete").click(function () {
		if (confirm("Are you sure you want to delete " + data.name + "?")) {
			$.post("php/delete_table.php", {table_id: data.id}, function () {
				// TODO: unload current table if you deleted the current table
				LT.refreshTables();
			});
		}
	});
};

  /////////////////////////////////////////////////////////////////////////////
 // piecesPanel.js ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

$(function () { // This anonymous function runs after the page loads.
	LT.piecesPanel = new LT.Panel("piecesPanel");
	$("#submitStats").click(function () {LT.Piece.updateStats();});
	$("#applyPieceChanges").click(function () {LT.Piece.selected.edit();});
	$("#deletePiece").click(function () {
		if (confirm("Are you sure you want to delete "
			+ LT.Piece.selected.name + "?")) LT.Piece.selected.remove({});
	});
	$("#createPiece").click(function () {LT.createPiece();});
	$("#addStat").click(function () {LT.Piece.addStat();});
});

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
	$.post("php/read_pieces.php", {table_id: LT.currentTable.id}, function (data) {
		LT.pieces = [];
		for (var i = 0; i < data.length; i++)
			LT.pieces.push(new LT.Piece(data[i]));
	}, "json");
};

LT.createPiece = function () {
	var args = LT.formValues("#pieceCreator");
	args.table_id = LT.currentTable.id;
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

