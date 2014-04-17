<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$image_id = $LT_SQL->real_escape_string($_REQUEST['id']);
$user_id = $LT_SQL->real_escape_string($_REQUEST['user_id']);
$public = $LT_SQL->real_escape_string($_REQUEST['public']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);
$center_x = $LT_SQL->real_escape_string($_REQUEST['center_x']);
$center_y = $LT_SQL->real_escape_string($_REQUEST['center_y']);
$tile_mode = $LT_SQL->real_escape_string($_REQUEST['tile_mode']);
$layer = $LT_SQL->real_escape_string($_REQUEST['layer']);

// Query the Database

if (LT_can_modify_image($image_id)) {
  LT_call('update_image', $image_id, $user_id, $public,
    $tile_width, $tile_height, $center_x, $center_y, $tile_mode, $layer);
}

?>
