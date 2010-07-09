<?php

include('db_config.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);

$name = mysqli_real_escape_string($_REQUEST['name']);
$background = mysqli_real_escape_string($_REQUEST['background']);

$tile_rows = mysqli_real_escape_string($_REQUEST['tile_rows']);
$tile_columns = mysqli_real_escape_string($_REQUEST['tile_columns']);
$tile_width = mysqli_real_escape_string($_REQUEST['tile_width']);
$tile_height = mysqli_real_escape_string($_REQUEST['tile_height']);

$grid_width = mysqli_real_escape_string($_REQUEST['grid_width']);
$grid_height = mysqli_real_escape_string($_REQUEST['grid_height']);
$grid_thickness = mysqli_real_escape_string($_REQUEST['grid_thickness']);
$grid_color = mysqli_real_escape_string($_REQUEST['grid_color']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die ("Connect failed: " + mysqli_error());

$query = "CALL create_table('$name', $background, $user_id, "
  . "$tile_rows, $tile_columns, $tile_width, $tile_height, "
  . "$grid_width, $grid_height, $grid_thickness, '$grid_color')";
$result = mysqli_query($link, $query) or die ("Query failed: " + mysqli_error());

$query = "CALL read_table_by_name('$name')";
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
