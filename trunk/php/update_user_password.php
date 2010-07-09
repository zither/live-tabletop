<?php

include('db_config.php');
include('users.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);
$password = mysqli_real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// STEP 2: Query the Database

if ($link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)) {
  mysqli_query($link, "CALL update_user_pasword($user_id, '$hash', '$salt')");
}

?>
