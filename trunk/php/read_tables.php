<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$result = $LT_SQL->query("CALL read_tables_by_user_id($user_id)")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('include/xml_headers.php');
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
