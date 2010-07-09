<?php

include('db_config.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_REQUEST['user_id']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die('Could not connect: ' . mysqli_error());
mysqli_query($link, "CALL delete_user($user_id)")
  or die('Query failed: ' . mysqli_error());

?>

