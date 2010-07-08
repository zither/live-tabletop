<?php

include('db_config.php');
include('users.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

// STEP 1: Interpret the Request

$username = mysqli_real_escape_string($_REQUEST['username']);
$password = mysqli_real_escape_string($_REQUEST['password']);
$permissions = mysqli_real_escape_string($_REQUEST['permissions']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die('Could not connect: ' . mysqli_error());

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);
$query = "CALL create_user('$username', '$hash', '$salt', NULL, '$permissions')";
mysqli_query($link, $query) or die('Query failed: ' . mysqli_error());

?>
