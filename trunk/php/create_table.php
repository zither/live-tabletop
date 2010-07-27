<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$background = $LT_SQL->real_escape_string($_REQUEST['background']);
$default_tile = $LT_SQL->real_escape_string($_REQUEST['default_tile']);

$tile_rows = $LT_SQL->real_escape_string($_REQUEST['rows']);
$tile_columns = $LT_SQL->real_escape_string($_REQUEST['columns']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);

// Query the Database

$result = $LT_SQL->query("CALL create_table('$name', $background, $user_id, "
  . "$tile_rows, $tile_columns, $tile_width, $tile_height)")
  or die ("create_table failed: " . $LT_SQL->error);

$result = $LT_SQL->query("CALL read_table_by_name('$name')")
  or die ("read_table_by_name failed: " . $LT_SQL->error);

$row = $result->fetch_assoc() or die ("Could not find table $name.");

$result = $LT_SQL->query("CALL create_tiles({$row['table_id']}, "
  . "$default_tile, $tile_columns, $tile_rows)");

if (!$result) {
  // if creating the tiles fails we should delete the table too.
  $error = $LT_SQL->error;
  $LT_SQL->query("CALL delete_table({$row['table_id']})")
    or die ("delete_table failed: " . $LT_SQL->error);
  die ("create_tiles failed: " . $error);
}

// Generate Output

include('include/xml_headers.php');
echo "<tables>\n";
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
echo "</tables>\n";

?>
