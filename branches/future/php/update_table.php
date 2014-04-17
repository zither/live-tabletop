<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$table_id = $LT_SQL->real_escape_string($_REQUEST['id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);
$grid_thickness = $LT_SQL->real_escape_string($_REQUEST['grid_thickness']);
$grid_color = $LT_SQL->real_escape_string($_REQUEST['grid_color']);
$wall_thickness = $LT_SQL->real_escape_string($_REQUEST['wall_thickness']);
$wall_color = $LT_SQL->real_escape_string($_REQUEST['wall_color']);
$tile_mode = $LT_SQL->real_escape_string($_REQUEST['tile_mode']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  LT_call('update_table', $table_id, $name, $user_id, $image_id,
    $tile_width, $tile_height, $grid_thickness, $grid_color,
    $wall_thickness, $wall_color, $tile_mode);
}

?>
