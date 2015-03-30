LT.pieceMoving = false;
LT.colorMaps = {};

$(function () { // This anonymous function runs after the page loads.

	// create new piece from external image URL
	$("#newPieceURL").click(function () {
		var url = prompt("external image URL");
		if (url != null && url.indexOf("://") != -1) {
			var coordinates = LT.screenToMap(
				$(window).scrollLeft() + $(window).width() / 2,
				$(window).scrollTop() + $(window).height() / 2);
			$.post("php/Piece.create.php", {
				"map": LT.currentMap.id,
				"image": JSON.stringify({
					"url": url,
					"view": "top",
					"size": [LT.HEIGHT, LT.HEIGHT],
					"center": [LT.HEIGHT / 2, LT.HEIGHT / 2],
					"base": [1, 1]}),
				"x": coordinates[0],
				"y": coordinates[1],
			}, LT.refreshMap);
		}
	});

	// precalculate LT.colorMaps palette swapping arrays
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
				"x": parseFloat(LT.pieceElement.css("left")) / LT.WIDTH,
				"y": parseFloat(LT.pieceElement.css("top"))  / LT.HEIGHT,
			}, LT.refreshMap);
		}
	});
	LT.dragHandlers.push(function (e) {
		if (e.ctrlKey) LT.cursorRequested = true;

		if (LT.pieceMoving) {
			var x = parseFloat(LT.pieceElement.css("left")) / LT.WIDTH;
			var y = parseFloat(LT.pieceElement.css("top")) / LT.HEIGHT;
			var mouse = LT.screenToMap(LT.dragX, LT.dragY);
			if (LT.clickDragGap == 0) {
				LT.clickX = mouse[0] - x;
				LT.clickY = mouse[1] - y;
				LT.clickDragGap = 1;
			}
			x = Math.max(0, Math.min(mouse[0] - LT.clickX, LT.currentMap.columns - 1));
			y = Math.max(0, Math.min(mouse[1] - LT.clickY, LT.currentMap.rows - 1));
			if ($("#snap").prop("checked")) {
				if (LT.currentMap.type == "hex") {
					x = Math.round(x * 6) / 6;
					y = Math.round(y * 4) / 4;
				} else {
					x = Math.round(x * 2) / 2;
					y = Math.round(y * 2) / 2;
				}
			}
			var style = {left: x * LT.WIDTH + "px", top: y * LT.HEIGHT + "px"};
			LT.pieceElement.css(style);
			LT.pieceMover.css(style);
		}
	});

}); // $(function () { // This anonymous function runs after the page loads.

// read piece images from images.json after it is loaded in mapPanel.js
LT.readPieceImages = function (pieceImageData) {
	$.each(pieceImageData, function (name, group) {
		$.each(group, function (i, image) {

			// create an image for the new piece tab
			$("<img>").appendTo($("#pieceCreatorImages")).addClass("swatch").attr({
				title: image.name || image.file,
				src: "images/" + image.file
			}).click(function () {
				var coordinates = LT.screenToMap(
					$(window).scrollLeft() + $(window).width() / 2,
					$(window).scrollTop() + $(window).height() / 2);
				$.post("php/Piece.create.php", {
					"map": LT.currentMap.id,
					"image": JSON.stringify(image),
					"x": coordinates[0],
					"y": coordinates[1],
					"name": image.name || "",
				}, LT.refreshMap);
			});

			// create an image for the piece info tab
			$("<img>").appendTo($("#pieceEditorImages")).addClass("swatch").attr({
				title: image.name || image.file,
				src: "images/" + image.file,
			}).click(function () {
				LT.pieceSelected.image = $.extend({}, image);
				LT.savePieceSettings(LT.pieceSelected);
				$("#pieceEditorImages *").removeClass("selected");
				$(this).addClass("selected");
			});

		}); // $.each(group, function (i, image) {
	}); // $.each(pieceImageData, function (name, group) {
}; // LT.readPieceImages = function (pieceImageData) {

// (re)load pieces after loading or refreshing the map
LT.loadPieces = function () {
	$.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
		var selectedPiece = LT.getCookie("piece");
		$("#pieceLayer, #clickPieceLayer").empty();
		$("#pieceList div:not(.template)").remove();
		$("#pieceListHelp").toggle(data.length > 0);
		$.each(data, function (i, piece) {
			var source = piece.image.url || "images/" + piece.image.file;
			var scale = piece.image.scale ? piece.image.scale / 100 : 1;
			var mirror = piece.image.view == "side" && piece.image.angle < 0;
			var angle = piece.image.angle || 0;
			if (piece.image.view == "side" || piece.image.view == "front") angle = 0;
			var style = {
				width:  piece.image.size[0] * scale + "px",
				height: piece.image.size[1] * scale + "px",
				left: piece.x * LT.WIDTH + "px",
				top:  piece.y * LT.HEIGHT + "px",
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
							Math.max(1, Math.ceil(Math.abs(2 * x / LT.HEIGHT))),
							Math.max(1, Math.ceil(Math.abs(2 * y / LT.HEIGHT)))]; break;
						case "scale": piece.image.scale =
							Math.round(200 * Math.sqrt(x * x + y * y) / LT.HEIGHT); break;
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
				LT.repaintPieceCanvas = function (out) {
					if (!LT.pieceSelected) return;
					var x, y;
					var offset = $("#pieceCanvas").offset();
					if ((typeof(out) != "boolean" || out == false)
						&& LT.dragX >= offset.left && LT.dragX < offset.left + canvas.width
						&& LT.dragY >= offset.top && LT.dragY < offset.top + canvas.height)
						{x = LT.dragX - offset.left; y = LT.dragY - offset.top;}
					var radius = LT.HEIGHT / 2;
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
//						$("#pieceCanvasText").text(Math.round(scale * 100) + "%");
					} else {
						var scale2 = Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)) / radius;
						context.scale(scale2, scale2)
//						$("#pieceCanvasText").text(Math.round(scale2 * 100) + "%");
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
					// FIXME: refreshing the map resets the zoom to 100% until you move the mouse
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
							drawBase(context, center[0], center[1], w, h, LT.HEIGHT, 4, "white");
							drawBase(context, center[0], center[1], w, h, LT.HEIGHT, 1.2, "black");
							$("#pieceCanvasText").text([w, h].join(", ")); break;
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
				$("#pieceCanvas").off("mousemove").mousemove(LT.repaintPieceCanvas)
					.off("mouseout").mouseout(function () {LT.repaintPieceCanvas(true);});
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
				$("#pieceBaseType").val(piece.image.baseType || "none").off("change").change(function () {
					piece.image.baseType = $(this).val();
					if (piece.image.baseType == "none") delete piece.image.baseType;
					LT.savePieceSettings(piece);
				});
				$("#pieceColor").val(piece.color).off("change").change(function () {
					piece.color = $(this).val();
					LT.savePieceSettings(piece);
				});

				$("#pieceFacing option:first-child").text(
					(piece.image.angle || 0) + String.fromCharCode(176));
				$("#pieceFacing").val("").off("change").change(function () {
					if ($(this).val() == "") return;
					piece.image.angle = parseInt($(this).val());
					LT.savePieceSettings(piece);
				});
				$("#pieceScale option:first-child").text(
					(piece.image.scale || 1) + "%");
				$("#pieceScale").val("").off("change").change(function () {
					if ($(this).val() == "") return;
					piece.image.scale = parseFloat($(this).val());
					LT.savePieceSettings(piece);
				});
				$("#pieceBaseSize option:first-child").text((piece.image.base || [1, 1])
					.join(" " + String.fromCharCode(215) + " "));
				$("#pieceBaseSize").val("").off("change").change(function () {
					if ($(this).val() == "") return;
					piece.image.base = [parseInt($(this).val()), parseInt($(this).val())];
					LT.savePieceSettings(piece);
				});
				$("#pieceCenter").off("click").click(function () {
					if (!confirm("Center this piece around the exact image center?")) return;
					piece.image.center = [piece.image.size[0] / 2, piece.image.size[1] / 2];
					LT.savePieceSettings(piece);
				});


				$("#pieceURL").text(piece.image.url || "");
				$("#changePieceURL").off("click").click(function () {
					var url = prompt("new external image URL", piece.image.url || "");
					if (url != null && url != piece.image.url) {
						piece.image = {
							"url": url,
							"view": "top",
							"size": [LT.HEIGHT, LT.HEIGHT],
							"center": [LT.HEIGHT / 2, LT.HEIGHT / 2],
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
					element.find("*").css("background-image", 
						"url('" + canvas.toDataURL() + "')");
				}
				// show piece in piece info tab.
				if (piece.id == selectedPiece) select();
			};
			var element = $("<div>").appendTo("#pieceLayer").append(
				$("<div>").css({
					"background-image": "url(" + source + ")",
					"transform": transform,
				})
			).css(style).css("z-index", piece.image.z || 0).data({
				"x": piece.x, "y": piece.y, "z": piece.image.z || 0
			}).addClass(piece.image.view);

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
			}).appendTo("#clickPieceLayer").css(style).data({
				"x": piece.x, "y": piece.y, "z": piece.image.z || 0
			}).addClass(piece.image.view);

			// piece list
			var copy = $("#pieceList .template").clone().removeClass("template");
			copy.find(".link").click(function () {
				window.scrollTo( // scroll map to center on piece
					element.offset().left - window.innerWidth / 2,
					element.offset().top - window.innerHeight / 2);
				select();
				$("#tools .swatch[data-tool=piece]").click();
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
		LT.transform(); // sort and transform pieces

	}); // $.post("php/Map.pieces.php", {map: LT.currentMap.id}, function (data) {
}; // LT.loadPieces = function () {

LT.sortPieces = function () {
	var sorter = function (a, b) {
		var difference = $(a).data("z") - $(b).data("z");
		if (difference) return difference;
		a = LT.mapToScreen($(a).data("x"), $(a).data("y"));
		b = LT.mapToScreen($(b).data("x"), $(b).data("y"));
		return a[1] - b[1];
	};
	$("#pieceLayer > *").sort(sorter).appendTo("#pieceLayer");
	$("#clickPieceLayer > *").sort(sorter).appendTo("#clickPieceLayer");
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


