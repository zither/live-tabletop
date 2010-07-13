<?php

session_start();

include('db_config.php');
include('ownership.php');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);

$table_id = mysqli_real_escape_string($_REQUEST['table_id']);
$name = mysqli_real_escape_string($_REQUEST['name']);
$background = mysqli_real_escape_string($_REQUEST['background']);

$grid_width = mysqli_real_escape_string($_REQUEST['grid_width']);
$grid_height = mysqli_real_escape_string($_REQUEST['grid_height']);
$grid_thickness = mysqli_real_escape_string($_REQUEST['grid_thickness']);
$grid_color = mysqli_real_escape_string($_REQUEST['grid_color']);

// STEP 2: Query the Database

if (LT_can_modify_table($table_id)) {
  $link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
    or die ("Connect failed: " + mysqli_error());
  $query = "CALL update_table($table_id, '$name', $user_id, $background, "
    . "$grid_width, $grid_height, $grid_thickness, '$grid_color')";
  $result = mysqli_query($link, $query)
    or die ("Query failed: " + mysqli_error());
}

?>
