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

// Load the Metadata for Uploaded Images

$document = new DOMDocument();
$document->load(getcwd()
  . DIRECTORY_SEPARATOR . '..'
  . DIRECTORY_SEPARATOR . 'images'
  . DIRECTORY_SEPARATOR . 'upload'
  . DIRECTORY_SEPARATOR . 'images.xml');

// Map File Name and Type to Metadata

$settings_map = array();
foreach($document->getElementsByTagName('image') as $image) {
  $file = $image->getAttribute('file');
  $type = $image->getAttribute('type');
  $settings_map[$type . DIRECTORY_SEPARATOR . $file] = array(
    'tile_width' => $image->getAttribute('tile_width'),
    'tile_height' => $image->getAttribute('tile_height'),
    'center_x' => $image->getAttribute('center_x'),
    'center_y' => $image->getAttribute('center_y'),
    'tile_mode' => $image->getAttribute('tile_mode');
}

// Query the Database

for ($i = 0; $i < count($LT_IMAGE_TYPES); $i++) {
  $type = $LT_IMAGE_TYPES[$i];

  // get all of the existing database entries for this image type
  $rows = LT_call_silent('read_images', $type);
  if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);

  // make a list of file names that won't be added to the database
  $ignore = array();
  for ($j = 0; $j < count($rows); $j++) {
    array_push($ignore, $rows[$j]["file"]);
  }

  // create a database entry for each image not in the ignore list
  $path = LT_image_type_path($type);
  $files = scandir($path);
  for ($j = 0; $j < count($files); $j++) {
    if (in_array($files[$j], $ignore)) continue;
    if (is_dir($path . DIRECTORY_SEPARATOR . $files[$j])) continue;
    $size = getimagesize($path . DIRECTORY_SEPARATOR . $files[$j]);
    $width = $size[0];
    $height = $size[1];
    $settings = $settings_map[$type . DIRECTORY_SEPARATOR . $files[$j]];
    $tile_width = $settings['tile_width'];
    $tile_height = $settings['tile_height'];
    $center_x = $settings['center_x'];
    $center_y = $settings['center_y'];
    if (!is_numeric($tile_width)) $tile_width = $width;
    if (!is_numeric($tile_height)) $tile_height = $height;
    if (!is_numeric($center_x)) $center_x = $width / 2;
    if (!is_numeric($center_y)) $center_y = $height / 2;
    if (!$tile_mode) $tile_mode = 'rectangle';
    $rows = LT_call_silent('create_image', $user, $files[$j], $type, 1,
      $width, $height, $tile_width, $tile_height, $center_x, $center_y, $tile_mode);
    if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);
  }
}

?>

