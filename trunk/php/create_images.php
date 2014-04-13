<?php

session_start();
if (!isset($_SESSION['user_id'])) die ("You are not logged in.");
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
	die ("You do not have permission to do this.");

include('db_config.php');
include('include/query.php');
include('include/images.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_SESSION['user_id']);

// load the json metadata for images in the filesystem
$data = json_decode(file_get_contents(getcwd()
	. DIRECTORY_SEPARATOR . '..'
	. DIRECTORY_SEPARATOR . 'images'
	. DIRECTORY_SEPARATOR . 'upload'
	. DIRECTORY_SEPARATOR . 'images.json'), true);

// index <image> elements by their type and file attributes
$settings = array();
foreach ($data as $image)
	$settings[$image['type'] . DIRECTORY_SEPARATOR . $image['file']] = $image;

// Query the Database

$attributes = array('tile_width', 'tile_height', 'center_x', 'center_y',
	'tile_mode', 'layer');

foreach ($LT_IMAGE_TYPES as $type) {

	// get all of the existing database entries for this image type
	$rows = LT_call_silent('read_images', $type);
	if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);

	// make a list of file names that won't be added to the database
	$ignore = array();
	foreach ($rows as $image) $ignore[] = $image['file'];

	// create a database entry for each image not in the ignore list
	$path = LT_image_type_path($type);
	foreach (scandir($path) as $file) {

		// make sure the file is not in the database and not a directory
		if (in_array($file, $ignore)) continue;
		$filename = $path . DIRECTORY_SEPARATOR . $file;
		if (is_dir($filename)) continue;

		// set the default settings for the image file
		$size = getimagesize($filename);
		$width = $size[0];
		$height = $size[1];
		$tile_width = $width;
		$tile_height = $height;
		$center_x = $width / 2;
		$center_y = $height / 2;
		$tile_mode = 'rectangle';
		$layer = 0;

		// replace default settings with attributes from the metadata
		$key = $type . DIRECTORY_SEPARATOR . $file;

		if (array_key_exists($key, $settings)) {
			$image = $settings[$key];
			foreach ($attributes as $attribute) {
				if (array_key_exists($attribute, $image))
					// wrapping $attribute in ${} sets variable of that name
					${$attribute} = $image[$attribute];
			}
		}

		// send the query that adds the image to the database
		$rows = LT_call_silent('create_image', $user, $file, $type, 1,
			$width, $height, $tile_width, $tile_height, $center_x, $center_y,
			$tile_mode, $layer);
		if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);
	}
}

?>

