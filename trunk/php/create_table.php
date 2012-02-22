<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$default_tile = $LT_SQL->real_escape_string($_REQUEST['default_tile']);
$tile_rows = $LT_SQL->real_escape_string($_REQUEST['rows']);
$tile_columns = $LT_SQL->real_escape_string($_REQUEST['columns']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);
$tile_mode = $LT_SQL->real_escape_string($_REQUEST['tile_mode']);
$grid_thickness = $LT_SQL->real_escape_string($_REQUEST['grid_thickness']);
$grid_color = $LT_SQL->real_escape_string($_REQUEST['grid_color']);
$wall_thickness = $LT_SQL->real_escape_string($_REQUEST['wall_thickness']);
$wall_color = $LT_SQL->real_escape_string($_REQUEST['wall_color']);

// Query the Database

LT_call('create_table', $name, $image_id, $user_id, $tile_rows, $tile_columns,
  $tile_width, $tile_height, $grid_thickness, $grid_color, $wall_thickness,
  $wall_color, $tile_mode);
$rows = LT_call('read_table_by_name', $name);
$table_id = $rows[0]['id'];
LT_call('create_tiles', $table_id, $default_tile, $tile_columns, $tile_rows);

// Generate Output

include('include/tables.php');
include('include/xml_headers.php');
echo "<tables>\n";
LT_write_table_row($rows[0]);
echo "</tables>\n";

?>
