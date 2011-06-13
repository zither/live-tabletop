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
$file = $LT_SQL->real_escape_string(basename($_FILES['file']['name']));
$size = getimagesize($_FILES['file']['tmp_name']);
$width = $size[0];
$height = $size[1];
$center_x = LT_request('center_x', $width / 2);
$center_y = LT_request('center_y', $height / 2);
$tile_width = LT_request('tile_width', $width);
$tile_height = LT_request('tile_height', $height);
$tile_mode = LT_request('tile_mode', 'rectangle');
$layer = LT_request('layer', 0);
$type = LT_request('type', 'no type request variable provided');
if (!LT_image_type($type)) done("Unsupported category: " . $type);

// Store the Uploaded Image

move_uploaded_file($_FILES['file']['tmp_name'], LT_image_path($type, $file))
  or done("Failed to move file.");

// Query the Database

$rows = LT_call_silent('create_image', $user, $file, $type, 0, $width, $height,
  $tile_width, $tile_height, $center_x, $center_y, $tile_mode, $layer);
if (!is_array($rows)) done("Query failed: " . $LT_SQL->error);

// Generate Output

done(array('user' => $user, 'file' => $file, 'type' => $type));
?>

