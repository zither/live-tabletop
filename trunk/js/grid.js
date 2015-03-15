LT.createGrid = function (map) {
	LT.walls = new Array(map.rows + 2);
	for (var y = 0; y < map.rows + 2; y++) {
		LT.walls[y] = new Array(map.columns + 2);
		for (var x = 0; x < map.columns + 2; x++) {
			LT.walls[y][x] = {"w": "none", "s": "none", "e": "none"};
		}
	}
	$.each(map.walls.split(""), function (i, code) {
		var x = i % (map.columns + 2);
		var y = Math.floor(i / (map.columns + 2));
		var walls = LT.BASE64.indexOf(code);
		// TODO: change magic numbers to constants
		if ((walls & 3)  == 1)  LT.walls[y][x]["e"] = "wall";
		if ((walls & 3)  == 2)  LT.walls[y][x]["e"] = "door";
		if ((walls & 3)  == 3)  LT.walls[y][x]["e"] = "open";
		if ((walls & 12) == 4)  LT.walls[y][x]["s"] = "wall";
		if ((walls & 12) == 8)  LT.walls[y][x]["s"] = "door";
		if ((walls & 12) == 12) LT.walls[y][x]["s"] = "open";
		if ((walls & 48) == 16) LT.walls[y][x]["w"] = "wall";
		if ((walls & 48) == 32) LT.walls[y][x]["w"] = "door";
		if ((walls & 48) == 48) LT.walls[y][x]["w"] = "open";
		// function to create click detectors for walls
		var createWallClickDetector = function (x, y, side, l, t, w, h) {
			$("<div>").appendTo($("#clickWallLayer")).css({
				"left": LT.WIDTH	* (x + l - 1) + "px",
				"top": LT.HEIGHT * (y + t - 1) + "px",
				"width": LT.WIDTH * w + "px",
				"height": LT.HEIGHT * h + "px",
			}).click(function () {
				var type = LT.walls[y][x][side];
				var mode = $("#wallMode").val();
				if (mode == "open") { // only affects open or closed doors
					if (type == "door") type = "open";
					else if (type == "open") type = "door";
				} else type = mode; // replaces anything
				$.post("php/Map.wall.php", {
					"map": map.id, "x": x, "y": y, "side": side, "type": type
				}, LT.refreshMap);
				LT.walls[y][x][side] = type;
				LT.paintGrid();
			});
		};
		// create the wall click detectors now
		if (map.type == "square") {
			if (x > 0) createWallClickDetector(x, y, "s", -1/3,  1/3, 2/3, 1/3);
			if (y > 0) createWallClickDetector(x, y, "e",  1/3, -1/3, 1/3, 2/3);
		}
		if (map.type == "hex") {
			var stagger = (1 - x % 2) * 0.5;
			if (x > 0 && x <= map.columns) // no south walls on side columns
				createWallClickDetector(x, y, "s", -1/3, stagger + 1/3, 2/3, 1/3);
			if (!(y == 0 && x % 2)) { // no sw, se sides on staggered top tiles
				// no se sides on right column, bottom-left corner or...
				if (x <= map.columns && !(x == 0 && y == map.rows)
					&& !(x == map.columns && y == 0)) // top 2nd-from-right tile
					createWallClickDetector(x, y, "e", 1/3, stagger, 1/3, 1/2);
				// no sw sides on left column or bottom-right non-staggered corner
				if (x > 0 && !(x > map.columns && y == map.rows && !(x % 2)))
					createWallClickDetector(x, y, "w", -2/3, stagger, 1/3, 1/2);
			}
		}
	});

	LT.paintGrid();
};

LT.paintGrid = function () {
	var context = $("#grid")[0].getContext("2d");
	var SHAPES = {
		"square": {
			directions: {n: 0, e: 1, s: 2, w: 3},
			points: [[0, 0], [1, 0], [1, 1], [0, 1]]},
		"hex": {
			directions: {n: 0, ne: 1, se: 2, s: 3, sw: 4, nw: 5, e: 2, w: 4},
			points: [[1/3, 0], [1, 0], [4/3, 1/2], [1, 1], [1/3, 1], [0, 1/2]]}};
	var points = SHAPES[LT.currentMap.type].points;
	var thickness = Math.max(LT.currentMap.grid_thickness, LT.currentMap.wall_thickness,
		LT.currentMap.door_thickness + 2 * Math.max(1, LT.currentMap.grid_thickness));

	// resize canvas to fit grid lines, walls and doors
	$("#grid")[0].width = thickness + LT.WIDTH
		* (LT.currentMap.columns + (LT.currentMap.type == "hex" ? 1/3 : 0));
	$("#grid")[0].height = thickness + LT.HEIGHT
		* (LT.currentMap.rows + (LT.currentMap.type == "hex" ? 1/2 : 0));

	// offset coordinate system to center of grid lines
	context.translate(thickness / 2 - LT.WIDTH, thickness / 2 - LT.HEIGHT);
	$("#grid").css({
		"margin-left": -(LT.currentMap.type == "hex" ? 2/3 : 0.5) * LT.WIDTH - thickness / 2 + "px",
		"margin-top": -(LT.currentMap.type == "hex" ? 0.5 : 0.5) * LT.HEIGHT - thickness / 2 + "px",
	});

	// draw grid
	if (LT.currentMap.grid_thickness) {
		context.strokeStyle = LT.currentMap.grid_color;
		context.lineWidth = LT.currentMap.grid_thickness;
		context.beginPath();
		for (var column = 1; column <= LT.currentMap.columns; column++) {
			var stagger = LT.currentMap.type == "hex" ? 0.5 * (1 - column % 2) : 0;
			for (var row = 1; row <= LT.currentMap.rows; row++) {
				context.moveTo(
					(points[0][0] + column) * LT.WIDTH,
					(points[0][1] + row + stagger) * LT.HEIGHT);
				for (var i = 1; i < points.length; i++) {
					context.lineTo(
						(points[i][0] + column) * LT.WIDTH,
						(points[i][1] + row + stagger) * LT.HEIGHT);
				}
				context.closePath();
			}
		}
		context.stroke();
	}

	// draw walls and doors
	if (LT.currentMap.wall_thickness) {
		$.each(new Array(3), function (layer) {
			$.each(LT.walls, function (y, row) {
				$.each(row, function (x, cell) {
					var stagger = LT.currentMap.type == "hex" ? 0.5 * (1 - x % 2) : 0;
					$.each(cell, function (side, type) {
						if (type == "none") return;
						var i = SHAPES[LT.currentMap.type].directions[side];
						if (typeof(i) == "undefined") return;
						var j = (i + 1) % points.length;
						var x1 = (points[i][0] + x) * LT.WIDTH;
						var y1 = (points[i][1] + y + stagger) * LT.HEIGHT;
						var x2 = (points[j][0] + x) * LT.WIDTH;
						var y2 = (points[j][1] + y + stagger) * LT.HEIGHT;
						var x3 = x1; var y3 = y1; var x4 = x2; var y4 = y2;
						if (type == "wall") {
							if (layer != 1) return;
							context.lineCap = "round";
							context.strokeStyle = LT.currentMap.wall_color;
							context.lineWidth = LT.currentMap.wall_thickness;
						} else {
							context.lineCap = "butt";
							var r = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
							var t = LT.currentMap.grid_thickness / r;
							if (layer == 0) {
								context.strokeStyle = LT.currentMap.wall_color;
								context.lineWidth = LT.currentMap.door_thickness + 2 * Math.max(1, LT.currentMap.grid_thickness);
							}
							if (layer == 1) {
								x3 = (x1 + t * x2) / (1 + t);
								y3 = (y1 + t * y2) / (1 + t);
								x4 = (t * x1 + x2) / (1 + t);
								y4 = (t * y1 + y2) / (1 + t);
								context.strokeStyle = LT.currentMap.door_color;
								context.lineWidth = LT.currentMap.door_thickness;
							}
							if (layer == 2) {
								if (type == "door") return;
								t = (LT.currentMap.grid_thickness + LT.currentMap.door_thickness + 1) / r;
								x3 = (x1 + t * x2) / (1 + t);
								y3 = (y1 + t * y2) / (1 + t);
								x4 = (t * x1 + x2) / (1 + t);
								y4 = (t * y1 + y2) / (1 + t);
								context.strokeStyle = LT.currentMap.wall_color;
								context.lineWidth = LT.currentMap.door_thickness + 1;
							}
						}
						context.beginPath();
						context.moveTo(x3, y3);
						context.lineTo(x4, y4);
						context.stroke();
					});
				});
			});
		});
	} // if (LT.currentMap.wall_thickness) {

};

LT.getWall = function (column, row, direction) {
	// normalize walls to avoid redundancy
	switch (direction) {
		case "n": direction = "s"; row--; break;
		case "w": direction = "e"; column--; break;
		case "nw": direction = "e"; column--; row -= column % 2; break;
		case "ne": direction = "w"; column++; row -= column % 2; break;
		case "sw": direction = "w"; break;
		case "se": direction = "e"; break;
	}
	return LT.walls[row][column][direction];
};


