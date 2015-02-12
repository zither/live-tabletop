import os, pygame, sys
from pygame.locals import *

PATH = "/usr/share/games/wesnoth/1.10/data/core/images/terrain"
TILES = {
	"cave": [
		{"name": "bank", "count": 3, "inside": "floor"},
		{"name": "earthy-floor", "count": 6},
		{"name": "flagstones-dark", "count": 3},
		{"name": "floor", "count": 6},
		{"name": "hills", "count": 3, "inside": "hills-variation"}],
	"chasm": [
		{"name": "abyss", "count": 7, "outside": "abyss-base"},
		{"name": "depths", "count": 1}],
	"embellishments": [
		{"name": "farm-veg-spring", "count": 3},
		{"name": "flower-purple", "count": 1, "outside": "flowers-mixed"},
		{"name": "flower-purple2", "count": 1, "outside": "flowers-mixed2", "inside": "flower-purple"},
		{"name": "flowers-mixed", "count": 4},
		{"name": "flowers-mixed2", "count": 4, "inside": "flowers-mixed"},
		{"name": "mushroom-farm", "count": 3}],
	"flat": [
		{"name": "bank", "count": 7, "inside": "dirt-dark"},
		{"name": "bank-to-ice", "count": 7, "inside": "dirt-dark"},
		{"name": "bank-to-ice2", "count": 7, "inside": "dirt-dark"},
		{"name": "desert-road", "count": 7},
		{"name": "desert-road2", "count": 7, "inside": "desert-road"},
		{"name": "desert-road-short", "count": 7, "inside": "desert-road", "outside": "desert-road", "extra": "desert-road-short"},
		{"name": "dirt", "count": 7},
		{"name": "dirt2", "count": 7, "inside": "dirt"},
		{"name": "dirt-dark", "count": 7},
		{"name": "road", "count": 4},
		{"name": "road-clean", "count": 3},
		{"name": "stone-path", "count": 2}],
	"frozen": [
		{"name": "ice", "count": 6},
		{"name": "ice-to-water", "count": 6, "inside": "ice", "outside": "ice", "extra": "ice-to-water"},
		{"name": "snow", "count": 3},
		{"name": "snow-to-water", "count": 3, "inside": "snow"}],
	"grass": [
		{"name": "dry-abrupt", "count": 6, "inside": "dry"},
		{"name": "dry-medium", "count": 6, "inside": "dry"},
		{"name": "dry-long", "count": 6, "inside": "dry", "outside": "dry-medium", "extra": "dry-long"},
		{"name": "flowers-abrupt", "count": 1, "inside": "flowers", "outside": "green-abrupt"},
		{"name": "flowers-medium", "count": 1, "inside": "flowers", "outside": "green-medium"},
		{"name": "flowers-long", "count": 1, "inside": "flowers", "outside": "green-medium", "extra": "green-long"},
		{"name": "green-abrupt", "count": 8, "inside": "green"},
		{"name": "green-medium", "count": 8, "inside": "green"},
		{"name": "green-long", "count": 8, "inside": "green", "outside": "green-medium", "extra": "green-long"},
		{"name": "leaf-litter", "count": 6},
		{"name": "leaf-litter-long", "count": 6, "inside": "leaf-litter", "outside": "leaf-litter", "extra": "leaf-litter-long"},
		{"name": "semi-dry-abrupt", "count": 6, "inside": "semi-dry"},
		{"name": "semi-dry-medium", "count": 6, "inside": "semi-dry"},
		{"name": "semi-dry-long", "count": 6, "inside": "semi-dry", "outside": "semi-dry-medium", "extra": "semi-dry-long"}],
	"hills": [
		{"name": "desert", "count": 3},
		{"name": "dry", "count": 3},
		{"name": "dry-to-water", "count": 3, "inside": "dry"}, # dry-to-water2-s.png
		{"name": "regular", "count": 3},
		{"name": "regular-to-water", "count": 3, "inside": "regular"}, # regular-to-water2-s.png
		{"name": "snow", "count": 3},
		{"name": "snow-to-hills", "count": 3, "inside": "snow"},
		{"name": "snow-to-water", "count": 3, "inside": "snow"}],
	"interior": [
		{"name": "wood-regular", "count": 3}],
	"mountains": [
		{"name": "basic", "count": 3},
		{"name": "basic-small", "count": 3, "inside": "basic"},
		{"name": "dry", "count": 3},
		{"name": "snow", "count": 3, "outside": "../hills/snow", "extra": "../hills/snow-to-hills"},
		{"name": "volcano", "count": 1, "outside": "dry"}],
	"sand": [
		{"name": "beach", "count": 8},
		{"name": "beach2", "count": 8, "inside": "beach"},
		{"name": "desert", "count": 8},
		{"name": "desert2", "count": 8, "inside": "desert"}],
	"swamp": [
		{"name": "mud-long", "count": 3, "inside": "mud", "outside": "mud-to-land", "extra": "mud-long"},
		{"name": "mud-to-land", "count": 3, "inside": "mud"},
		{"name": "water", "count": 3},
		{"name": "water-flowers1", "count": 1, "outside": "water"},
		{"name": "water-flowers2", "count": 1, "outside": "water"},
		{"name": "water-plant1", "count": 1, "outside": "water"},
		{"name": "water-plant2", "count": 1, "outside": "water"}],
	"void": [
		{"name": "void", "count": 1}],
	"water": [
		{"name": "ford", "count": 1}]}
for i in range (1, 16):
	TILES["water"].append({"name": "coast-tropical-A%02d" % i, "count": 1})
	TILES["water"].append({"name": "coast-tropical-long-A%02d" % i, "count": 1,
			"inside": "coast-tropical-A%02d" % i,
			"outside": "coast-tropical-A%02d" % i,
			"extra": "coast-tropical-long-A%02d" % i})
	TILES["water"].append({"name": "ocean-A%02d" % i, "count": 1})
	TILES["water"].append({"name": "ocean-blend-A%02d" % i, "count": 1,
			"inside": "ocean-A%02d" % i,
			"outside": "ocean-A%02d" % i,
			"extra": "ocean-blend-A%02d" % i})
	TILES["water"].append({"name": "ocean-long-A%02d" % i, "count": 1,
			"inside": "ocean-A%02d" % i})
	TILES["water"].append({"name": "ocean-long-blend-A%02d" % i, "count": 1,
			"inside": "ocean-A%02d" % i,
			"outside": "ocean-long-A%02d" % i,
			"extra": "ocean-blend-A%02d" % i})
DIRECTIONS = (
	("s", 0, -72),
	("sw", 54, -36),
	("nw", 54, 36),
	("n", 0, 72),
	("ne", -54, 36),
	("se", -54, -36))
HEIGHT = 144
WIDTH = 144

#pygame.init()


def center((w1, h1), (w2, h2), (x, y)):
	return (w1 - w2) / 2 + x, (h1 - h2) / 2 + y

for folder in TILES:
	print "%s:" % folder ,
	if not os.path.exists(folder):
		os.makedirs(folder)
	for tile in TILES[folder]:
		name, count = tile["name"], tile["count"]
		inside, outside = name, name
		if "inside" in tile: inside = tile["inside"]
		if "outside" in tile: outside = tile["outside"]
		for i in range(1, count + 1):
			if count == 1:
				newFileName = "%s.png" % os.path.join(folder, name)
			else:
				newFileName = "%s-%s.png" % (os.path.join(folder, name), i)
			print newFileName ,
			newImage = pygame.Surface((WIDTH, HEIGHT), SRCALPHA, 32)
			# outside hexes
			for direction, x, y in DIRECTIONS:
				oldFileName = "%s-%s.png" % (os.path.join(PATH, folder, outside), direction)
				if os.path.exists(oldFileName):
					oldImage = pygame.image.load(oldFileName)
					newImage.blit(oldImage, center((WIDTH, HEIGHT), oldImage.get_size(), (x, y)))
			# extra shadows, transitions, etc.
			if "extra" in tile:
				for direction, x, y in DIRECTIONS:
					oldFileName = "%s-%s.png" % (os.path.join(PATH, folder, tile["extra"]), direction)
					if os.path.exists(oldFileName):
						oldImage = pygame.image.load(oldFileName)
						newImage.blit(oldImage, center((WIDTH, HEIGHT), oldImage.get_size(), (x, y)))
			# center hex
			if i == 1:
				oldFileName = "%s.png" % os.path.join(PATH, folder, inside)
			else:
				oldFileName = "%s%s.png" % (os.path.join(PATH, folder, inside), i) 
			if os.path.exists(oldFileName):
				oldImage = pygame.image.load(oldFileName)#.convert()
				newImage.blit(oldImage, center((WIDTH, HEIGHT), oldImage.get_size(), (0, 0)))
			pygame.image.save(newImage, newFileName)
#			sys.exit(0)		
	print
	print

