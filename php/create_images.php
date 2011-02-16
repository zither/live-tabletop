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
  $names = scandir($path);
  for ($j = 0; $j < count($names); $j++) {
    if (in_array($names[$j], $ignore)) continue;
    if (is_dir($path . DIRECTORY_SEPARATOR . $names[$j])) continue;
    $rows = LT_call_silent('create_image', $user, $names[$j], $type, 1);
    if (!is_array($rows)) die("Query failed: " . $LT_SQL->error);
  }
}

?>

