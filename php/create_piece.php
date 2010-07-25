<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');
include('ownership.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$user_id = $LT_SQL->real_escape_string($_REQUEST['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$x = $LT_SQL->real_escape_string($_REQUEST['x']);
$y = $LT_SQL->real_escape_string($_REQUEST['y']);
$x_offset = $LT_SQL->real_escape_string($_REQUEST['x_offset']);
$y_offset = $LT_SQL->real_escape_string($_REQUEST['y_offset']);
$width = $LT_SQL->real_escape_string($_REQUEST['width']);
$height = $LT_SQL->real_escape_string($_REQUEST['height']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  $LT_SQL->query("CALL create_piece($table_id, $image_id, $user_id, '$name', "
    . "$x, $y, $x_offset, $y_offset, $width, $height)")
    or die ("Query failed: " . $LT_SQL->error);
}

?>
