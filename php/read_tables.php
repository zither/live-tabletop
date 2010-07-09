<?php

include('db_config.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die ("Connect failed: " + mysqli_error());

$query = "CALL read_tables_by_user_id($user_id)";
$result = mysqli_query($link, $query) or die ("Query failed: " + mysqli_error());

// STEP 3: Generate Output

include('xml_headers.php');
echo "<tables>\n";
while($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
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
