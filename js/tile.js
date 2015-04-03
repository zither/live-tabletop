LT.tiles = {};

// read tile images from images.json after it is loaded in LT.js
LT.readTileImages = function (tileImageData) {
	$.each(tileImageData, function (name, group) {
		$.each(group, function (i, image) {
			LT.tiles[image.id] = image; // to look up map tile data by index
			$("<img>").appendTo("#tilePalette").attr({
				"title": image.file,
				"src": "images/" + image.file,
				"id": "tile" + image.id,
			}).addClass("swatch").click(function () {
				$("#tilePalette *").removeClass("selected");
				$(this).addClass("selected");
				$("#erase").prop("checked", false);
				LT.tile = image.id;
			});
		});
	});
	$("#toolOptions [data-tool=tile] .swatch:first-child").click();
};

// create or update tiles after loading or refreshing the map
LT.loadTiles = function () {

	$.get("php/Map.read.php", {map: LT.currentMap.id}, function (map) {

		// sort tiles after creating or painting tiles
		var sortTiles = function () {
			$("#tileLayer *").sort(function (a, b) {
				return $(a).data("order") - $(b).data("order");
			}).appendTo("#tileLayer");
		}

		// empty and resize layers
		$("#tileLayer, #clickTileLayer, #clickWallLayer, #fogLayer").empty();
		$("#clickWallLayer, #clickTileLayer").css({
			"width": LT.WIDTH * map.columns + "px",
			"height": LT.HEIGHT * map.rows + "px",
		});
		$("#map").css({
			"width": LT.WIDTH * (map.columns - 1) + "px",
			"height": LT.HEIGHT * (map.rows - 1) + "px",
		});

		// create walls and doors
		LT.createGrid(map);

		// tiles and fog
		var toggleFog = 0;
		var fogXY = new Array(map.rows + 2);
		for (var y = 0; y < map.rows + 2; y++) {
			fogXY[y] = new Array(map.columns + 2);
			for (var x = 0; x < map.columns + 2; x++) {
				if (x > 0 && y > 0 && x <= map.columns && y <= map.rows) {
					var i = (x - 1) + (y - 1) * map.columns;
					var fogIndex = LT.BASE64.indexOf(map.fog[Math.floor(i / 6)]);
					fogXY[y][x] = Math.floor(fogIndex / Math.pow(2, 5 - i % 6)) % 2;
				}
			} 
		}
		$.each(map.tiles.match(/.{1,2}/g), function (i, code) {
			var x = i % map.columns;
			var y = Math.floor(i / map.columns);
			var stagger = map.type == "hex" ? (x % 2) * 0.5 : 0;
			var tileElement = null;
			var fogElement = null;
			var tile = LT.BASE64.indexOf(code[0]) * 64 + LT.BASE64.indexOf(code[1]);

			// function that generates CSS shared by fog and tile elements
			var style = function (image) {
				var scaleX = LT.WIDTH  / image[map.type][0];
				var scaleY = LT.HEIGHT / image[map.type][1];
				return {
					"left": LT.WIDTH * x + "px",
					"top": LT.HEIGHT * (y + stagger) + "px",
					"width":  image.size[0] * scaleX + "px",
					"height": image.size[1] * scaleY + "px",
					"margin-left": -image.center[0] * scaleX + "px",
					"margin-top":  -image.center[1] * scaleY + "px",
					"z-index": image.layer,
				};
			};

			// function to create or update the tile image element
			var updateTileElement = function () {
				if (tile > 0) {
					// TODO: new tile will not be in correct order until refresh
					if (tileElement === null) tileElement = $("<img>").appendTo("#tileLayer");
					var image = LT.tiles[tile];
					tileElement.attr("src", "images/" + image.file).css(style(image));
					tileElement.data("order", 2 * i + 3 * (x % 2));
				} else {
					if (tileElement) tileElement.remove();
					tileElement = null;
				}
			};

			// function to create or update the fog image element
			var updateFogElement = function () {
				var c = x + 1;
				var r = y + 1;
				if (fogXY[r][c]) {
					if (fogElement === null)
						fogElement = $("<div>").appendTo("#fogLayer");
					fogElement.removeClass("hex square").addClass(map.type).css({
						"left": LT.WIDTH * x + "px",
						"top": LT.HEIGHT * (y + stagger) + "px",
					}).empty();
					var fogBlender = $("<div>").appendTo(fogElement);
					var sideN = LT.walls[r - 1][c]["s"] == "none";
					var sideS = LT.walls[r][c]["s"] == "none";
					var fogN = fogXY[r - 1][c] == 0;
					var fogS = fogXY[r + 1][c] == 0;
					var edgeN = y == 0;
					var edgeS = y == map.rows - 1;
					var edgeW = x == 0;
					var edgeE = x == map.columns - 1;
					if (sideN && fogN || edgeN) fogBlender.append($("<div>").addClass("side n"));
					if (sideS && fogS || edgeS) fogBlender.append($("<div>").addClass("side s"));

					if (map.type == "square") {
						var sideW = LT.walls[r][c - 1]["e"] == "none";
						var sideE = LT.walls[r][c]["e"] == "none";
						var cornerNNW = LT.walls[r - 1][c - 1]["e"] == "none";
						var cornerWNW = LT.walls[r - 1][c - 1]["s"] == "none";
						var cornerNNE = LT.walls[r - 1][c]["e"] == "none";
						var cornerENE = LT.walls[r - 1][c + 1]["s"] == "none";
						var cornerSSW = LT.walls[r + 1][c - 1]["e"] == "none";
						var cornerWSW = LT.walls[r][c - 1]["s"] == "none";
						var cornerSSE = LT.walls[r + 1][c]["e"] == "none";
						var cornerESE = LT.walls[r][c + 1]["s"] == "none";
						var fogW = fogXY[r][c - 1] == 0;
						var fogE = fogXY[r][c + 1] == 0;
						var fogNW = fogXY[r - 1][c - 1] == 0;
						var fogNE = fogXY[r - 1][c + 1] == 0;
						var fogSW = fogXY[r + 1][c - 1] == 0;
						var fogSE = fogXY[r + 1][c + 1] == 0;

						if (fogW && sideW || edgeW) fogBlender.append($("<div>").addClass("side w"));
						if (fogE && sideE || edgeE) fogBlender.append($("<div>").addClass("side e"));

						if (sideN && sideW && cornerNNW && cornerWNW && (fogNW || fogN || fogW) || edgeW || edgeN)
							fogBlender.append($("<div>").addClass("corner nw"));
						if (sideN && sideE && cornerNNE && cornerENE && (fogNE || fogN || fogE) || edgeE || edgeN)
							fogBlender.append($("<div>").addClass("corner ne"));
						if (sideS && sideW && cornerSSW && cornerWSW && (fogSW || fogS || fogW) || edgeW || edgeS)
							fogBlender.append($("<div>").addClass("corner sw"));
						if (sideS && sideE && cornerSSE && cornerESE && (fogSE || fogS || fogE) || edgeE || edgeS)
							fogBlender.append($("<div>").addClass("corner se"));
/**/
/*
						if (sideN && sideW && cornerNNW && cornerWNW || edgeW || edgeN)
							fogBlender.append($("<div>").addClass("corner nw"));
						if (sideN && sideE && cornerNNE && cornerENE || edgeE || edgeN)
							fogBlender.append($("<div>").addClass("corner ne"));
						if (sideS && sideW && cornerSSW && cornerWSW || edgeW || edgeS)
							fogBlender.append($("<div>").addClass("corner sw"));
						if (sideS && sideE && cornerSSE && cornerESE || edgeE || edgeS)
							fogBlender.append($("<div>").addClass("corner se"));
/**/
					}
					if (map.type == "hex") {
						var s = x % 2;
						var sideNW = LT.walls[r + s - 1][c - 1]["e"] == "none";
						var sideNE = LT.walls[r + s - 1][c + 1]["w"] == "none";
						var sideSW = LT.walls[r][c]["w"] == "none";
						var sideSE = LT.walls[r][c]["e"] == "none";
						var cornerNW = LT.walls[r - 1][c]["w"] == "none";
						var cornerNE = LT.walls[r - 1][c]["e"] == "none";
						var cornerW = LT.walls[r + s - 1][c - 1]["s"] == "none";
						var cornerE = LT.walls[r + s - 1][c + 1]["s"] == "none";
						var cornerSW = LT.walls[r + s][c - 1]["e"] == "none";
						var cornerSE = LT.walls[r + s][c + 1]["w"] == "none";
						var fogNW = fogXY[r + s - 1][c - 1] == 0;
						var fogNE = fogXY[r + s - 1][c + 1] == 0;
						var fogSW = fogXY[r + s][c - 1] == 0;
						var fogSE = fogXY[r + s][c + 1] == 0;
						if (fogNW && sideNW || edgeW || edgeN && s == 0) fogBlender.append($("<div>").addClass("side nw"));
						if (fogNE && sideNE || edgeE || edgeN && s == 0) fogBlender.append($("<div>").addClass("side ne"));
						if (fogSW && sideSW || edgeW || edgeS && s == 1) fogBlender.append($("<div>").addClass("side sw"));
						if (fogSE && sideSE || edgeE || edgeS && s == 1) fogBlender.append($("<div>").addClass("side se"));
/*
						if (cornerNW && sideNW && sideN) fogBlender.append($("<div>").addClass("corner nw"));
						if (cornerNE && sideNE && sideN) fogBlender.append($("<div>").addClass("corner ne"));
						if (cornerW && sideNW && sideSW) fogBlender.append($("<div>").addClass("corner w"));
						if (cornerE && sideNE && sideSE) fogBlender.append($("<div>").addClass("corner e"));
						if (cornerSW && sideSW && sideS) fogBlender.append($("<div>").addClass("corner sw"));
						if (cornerSE && sideSE && sideS) fogBlender.append($("<div>").addClass("corner se"));
*/
						if (cornerNW && sideNW && sideN && (fogN  || fogNW) || edgeW || edgeN)
							fogBlender.append($("<div>").addClass("corner nw"));
						if (cornerNE && sideNE && sideN && (fogN  || fogNE) || edgeE || edgeN)
							fogBlender.append($("<div>").addClass("corner ne"));
						if (cornerW && sideNW && sideSW && (fogNW || fogSW) || edgeW)
							fogBlender.append($("<div>").addClass("corner w"));
						if (cornerE && sideNE && sideSE && (fogNE || fogSE) || edgeE)
							fogBlender.append($("<div>").addClass("corner e"));
						if (cornerSW && sideSW && sideS && (fogS  || fogSW) || edgeW || edgeS)
							fogBlender.append($("<div>").addClass("corner sw"));
						if (cornerSE && sideSE && sideS && (fogS  || fogSE) || edgeE || edgeS)
							fogBlender.append($("<div>").addClass("corner se"));
					}
				} else {
					if (fogElement) fogElement.remove();
					fogElement = null;
				}
			}; // var updateFogElement = function () {

			// function called when clicking or dragging over the tile
			var updateTile = function () {
				var tool = $("#tools .swatch.selected").data("tool");
				if (tool == "tile") {
					tile = $("#erase").prop("checked") ? 0 : LT.tile;
					$.post("php/Map.tile.php", {"map": map.id, "x": x, "y": y, "tile": tile});
					updateTileElement();
					if (tile) sortTiles();
				} else if (tool == "fog") {
					fogXY[y + 1][x + 1] = toggleFog;
					$.post("php/Map.fog.php", {"map": map.id, "x": x, "y": y, "fog": fogXY[y + 1][x + 1]});
					updateFogElement();
				}
			};

			// create tile and fog clickable element
			$("<div>").appendTo("#clickTileLayer").css({
				"left": LT.WIDTH * x + "px",
				"top": LT.HEIGHT * (y + stagger) + "px",
				"width": LT.WIDTH + "px",
				"height": LT.HEIGHT + "px",
				"margin-top": -LT.HEIGHT / 2 + "px",
				"margin-left": -LT.WIDTH / 2 + "px",
			}).mousedown(function () { // click
				LT.dragging = 1;
				toggleFog = 1 - fogXY[y + 1][x + 1];
				updateTile();
			}).mouseover(function () { // drag
				if (LT.dragging) updateTile();
			});

			updateTileElement();
			updateFogElement();

		}); // $.each(map.flags.split(""), function (i, flag) {

	sortTiles();

	}); // $.get("php/Map.read.php", {map: LT.currentMap.id}, function (data) {

}; // LT.loadTiles = function () {

