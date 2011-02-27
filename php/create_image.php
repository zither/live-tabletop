<?php

session_start();

function done($result) {
  echo '<script language="javascript" type="text/javascript">'
    . "\n   window.top.window.LT.Uploader.finish({$_REQUEST['uploader']}, "
    . json_encode($result) . ");\n</script>";
  die();
}

if (!isset($_SESSION['user_id'])) done("You are not logged in.");

include('db_config.php');
include('include/query.php');
include('include/images.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);
if (!LT_image_type($type)) done("Unsupported category: " . $type);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);
$center_x = $LT_SQL->real_escape_string($_REQUEST['center_x']);
$center_y = $LT_SQL->real_escape_string($_REQUEST['center_y']);
$tile_mode = $LT_SQL->real_escape_string($_REQUEST['tile_mode']);
$file = $LT_SQL->real_escape_string(basename( $_FILES['file']['name']));
$size = getimagesize($_FILES['file']['tmp_name']);
$width = $size[0];
$height = $size[1];

// Set Default Tile Dimensions and Center

if (!is_numeric($tile_width)) $tile_width = $width;
if (!is_numeric($tile_height)) $tile_height = $height;
if (!is_numeric($center_x)) $center_x = $width / 2;
if (!is_numeric($center_y)) $center_y = $height / 2;

// Store the Uploaded Image

move_uploaded_file($_FILES['file']['tmp_name'], LT_image_path($type, $file))
  or done("Failed to move file.");

// Query the Database

$rows = LT_call_silent('create_image', $user, $file, $type, 0, $width, $height,
  $tile_width, $tile_height, $center_x, $center_y, $tile_mode);
if (!is_array($rows)) done("Query failed: " . $LT_SQL->error);

// Generate Output

done(array('user' => $user, 'file' => $file, 'type' => $type));
?>

