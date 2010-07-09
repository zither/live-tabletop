<?php

include('db_config.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$admin = strcmp($_SESSION['permissions'], 'administrator') == 0;
$user_id = mysqli_real_escape_string($_SESSION['user_id']);

$name = mysqli_real_escape_string($_REQUEST['name']);
$background = mysqli_real_escape_string($_REQUEST['background']);

$grid_width = mysqli_real_escape_string($_REQUEST['grid_width']);
$grid_height = mysqli_real_escape_string($_REQUEST['grid_height']);
$grid_thickness = mysqli_real_escape_string($_REQUEST['grid_thickness']);
$grid_color = mysqli_real_escape_string($_REQUEST['grid_color']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die ("Connect failed: " + mysqli_error());

// only admins may update other user's tables.
$result = (mysqli_query($link, "CALL read_table($table_id)")
  or die ("Query error: " + mysqli_error());
$row = mysqli_fetch_array($result, MYSQLI_ASSOC);
if (!$admin && $user_id != $row['user_id'])
  die("You do not have permission to do this.");

// update the table
$query = "CALL update_table($table_id, '$name', $user_id, $background, "
  . "$grid_width, $grid_height, $grid_thickness, '$grid_color')";
$result = mysqli_query($link, $query)
  or die ("Query failed: " + mysqli_error());

?>
