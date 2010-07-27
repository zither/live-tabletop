<?php

session_start();

include('db_config.php');
include('include/ownership.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$background = $LT_SQL->real_escape_string($_REQUEST['background']);

$grid_width = $LT_SQL->real_escape_string($_REQUEST['grid_width']);
$grid_height = $LT_SQL->real_escape_string($_REQUEST['grid_height']);
$grid_thickness = $LT_SQL->real_escape_string($_REQUEST['grid_thickness']);
$grid_color = $LT_SQL->real_escape_string($_REQUEST['grid_color']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  $LT_SQL->query("CALL update_table($table_id, '$name', $user_id, $background,"
    . " $grid_width, $grid_height, $grid_thickness, '$grid_color')")
    or die ("Query failed: " . $LT_SQL->error);
}

?>
