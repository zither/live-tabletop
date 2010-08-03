<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$default_tile = $LT_SQL->real_escape_string($_REQUEST['default_tile']);

$tile_rows = $LT_SQL->real_escape_string($_REQUEST['rows']);
$tile_columns = $LT_SQL->real_escape_string($_REQUEST['columns']);
$tile_width = $LT_SQL->real_escape_string($_REQUEST['tile_width']);
$tile_height = $LT_SQL->real_escape_string($_REQUEST['tile_height']);

// Query the Database

$LT_SQL->query("CALL create_table('$name', $image_id, $user_id, "
  . "$tile_rows, $tile_columns, $tile_width, $tile_height)")
  or die ("create_table failed: " . $LT_SQL->error);

$LT_SQL->multi_query("CALL read_table_by_name('$name')")
  or die ("read_table_by_name failed: " . $LT_SQL->error);
$result = $LT_SQL->store_result();
$row = $result->fetch_assoc() or die ("Could not find table $name.");
$table_id = $row['id'];
if ($LT_SQL->more_results()) {
  while($LT_SQL->next_result());
}

$LT_SQL->query("CALL create_tiles($table_id, "
  . "$default_tile, $tile_columns, $tile_rows)")
  or die ("create_tiles failed: " . $LT_SQL->error);


// Generate Output

include('include/tables.php');
include('include/xml_headers.php');
echo "<tables>\n";
LT_write_table_row($row);
echo "</tables>\n";

?>
