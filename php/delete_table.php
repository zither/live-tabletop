<?php

include('db_config.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);
$table_id = mysqli_real_escape_string($_REQUEST['table_id']);
$admin = strcmp($_SESSION['permissions'], 'administrator') == 0;

// STEP 2: Query the Database

// connect to database
$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die ("Connect error: " + mysqli_error());

// only admins may delete other user's tables
$result = (mysqli_query($link, "CALL read_table($table_id)")
  or die ("Query error: " + mysqli_error());
$row = mysqli_fetch_array($result, MYSQLI_ASSOC);
if (!$admin && $user_id != $row['user_id'])
  die("You do not have permission to do this.");

// remove the table from the tables table
$result = (mysqli_query($link, "CALL delete_table($table_id)")
  or die ("Query error: " + mysqli_error());

?>
