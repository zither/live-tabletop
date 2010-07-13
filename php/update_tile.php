<?php

session_start();

include('db_config.php');
include('ownership.php');

// STEP 1: Interpret the Request

$table_id = mysqli_real_escape_string($_REQUEST['table_id']);
$x = mysqli_real_escape_string($_REQUEST['x']);
$y = mysqli_real_escape_string($_REQUEST['y']);

$image_id = mysqli_real_escape_string($_REQUEST['image_id']);
$fog = mysqli_real_escape_string($_REQUEST['fog']);
$right = mysqli_real_escape_string($_REQUEST['right']);
$bottom = mysqli_real_escape_string($_REQUEST['bottom']);

// STEP 2: Query the Database

if (LT_can_modify_table($table_id)) {
  $link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
    or die ("Connect failed: " + mysqli_error());
  $query = "CALL update_tile($table_id, $x, $y, $image_id, $fog, $right, $bottom)";
  $result = mysqli_query($link, $query) or die ("Query failed: " + mysqli_error());
}

?>
