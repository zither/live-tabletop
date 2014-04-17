<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$piece_id = $LT_SQL->real_escape_string($_REQUEST['id']);
$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$user_id = $LT_SQL->real_escape_string($_REQUEST['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$x = $LT_SQL->real_escape_string($_REQUEST['x']);
$y = $LT_SQL->real_escape_string($_REQUEST['y']);
$x_offset = $LT_SQL->real_escape_string($_REQUEST['x_offset']);
$y_offset = $LT_SQL->real_escape_string($_REQUEST['y_offset']);
$width = $LT_SQL->real_escape_string($_REQUEST['width']);
$height = $LT_SQL->real_escape_string($_REQUEST['height']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);

// Query the Database

if (LT_can_modify_piece($piece_id)) {
  LT_call('update_piece', $piece_id, $image_id, $user_id, $name,
    $x, $y, $x_offset, $y_offset, $width, $height, $color);
}

?>
