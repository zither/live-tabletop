<?php

session_start();

include('db_config.php');
include('ownership.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$x = $LT_SQL->real_escape_string($_REQUEST['x']);
$y = $LT_SQL->real_escape_string($_REQUEST['y']);

$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$fog = $LT_SQL->real_escape_string($_REQUEST['fog']);
$right = $LT_SQL->real_escape_string($_REQUEST['right']);
$bottom = $LT_SQL->real_escape_string($_REQUEST['bottom']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  $LT_SQL->query(
    "CALL update_tile($table_id, $x, $y, $image_id, $fog, $right, $bottom)")
    or die ("Query failed: " . $LT_SQL->error);
}

?>
