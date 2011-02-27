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

// load the xml metadata for images in the filesystem
$document = new DOMDocument();
$document->load(getcwd()
  . DIRECTORY_SEPARATOR . '..'
  . DIRECTORY_SEPARATOR . 'images'
  . DIRECTORY_SEPARATOR . 'upload'
  . DIRECTORY_SEPARATOR . 'images.xml');

// index <image> elements by their type and file attributes
$settings = array();
foreach($document->getElementsByTagName('image') as $image) {
  $type = $image->getAttribute('type');
  $file = $image->getAttribute('file');
  $settings[$type . DIRECTORY_SEPARATOR . $file] = $image;
}

// Query the Database

$attributes = array('tile_width', 'tile_height', 'center_x', 'center_y', 'tile_mode');
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

    // make sure the file is not in the database and not a directory
    if (in_array($files[$j], $ignore)) continue;
    $filename = $path . DIRECTORY_SEPARATOR . $files[$j];
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

    // replace default settings with attributes from the metadata
    $key = $type . DIRECTORY_SEPARATOR . $files[$j];
    if (array_key_exists($key, $settings)) {
      $image = $settings[$type . DIRECTORY_SEPARATOR . $files[$j]];
      foreach ($attributes as $attribute) {
        $value = $image->getAttribute($attribute);
        if ($value) ${$attribute} = $value;
      }
    }

    // send the query that adds the image to the database
    $rows = LT_call_silent('create_image', $user, $files[$j], $type, 1,
      $width, $height, $tile_width, $tile_height, $center_x, $center_y, $tile_mode);
    if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);
  }
}

?>

