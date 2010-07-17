<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$background = $LT_SQL->real_escape_string($_REQUEST['background']);

$tile_rows = $LT_SQL->real_escape_string($_REQUEST['tile_rows']);
$tile_columns = $LT_SQL->real_escape_string($_REQUEST['tile_columns']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);

$grid_width = $LT_SQL->real_escape_string($_REQUEST['grid_width']);
$grid_height = $LT_SQL->real_escape_string($_REQUEST['grid_height']);
$grid_thickness = $LT_SQL->real_escape_string($_REQUEST['grid_thickness']);
$grid_color = $LT_SQL->real_escape_string($_REQUEST['grid_color']);

// Query the Database

$LT_SQL->query("CALL create_table('$name', $background, $user_id, "
  . "$tile_rows, $tile_columns, $tile_width, $tile_height, "
  . "$grid_width, $grid_height, $grid_thickness, '$grid_color')")
  or die ("Query failed: " . $LT_SQL->error);

$LT_SQL->query("CALL read_table_by_name('$name')")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('xml_headers.php');
echo "<tables>\n";
while($row = $result->fetch_assoc()) {
  echo "  <table"
    . " id=\"{$row['table_id']}\""
    . " user=\"{$row['user_id']}\""
    . " name=\"{$row['name']}\""
    . " background=\"{$row['image_id']}\""
    . " tile_rows=\"{$row['tile_rows']}\""
    . " tile_columns=\"{$row['tile_columns']}\""
    . " tile_width=\"{$row['tile_width']}\""
    . " tile_height=\"{$row['tile_height']}\""
    . " grid_width=\"{$row['grid_width']}\""
    . " grid_height=\"{$row['grid_height']}\""
    . " grid_thickness=\"{$row['grid_thickness']}\""
    . " grid_color=\"{$row['grid_color']}\""
    . " piece_stamp=\"{$row['piece_stamp']}\""
    . " tile_stamp=\"{$row['tile_stamp']}\""
    . " message_stamp=\"{$row['message_stamp']}\""
    . "/>\n";
}
echo "</tables>\n";

?>
