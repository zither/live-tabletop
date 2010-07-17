<?php

include('db_config.php');
include('users.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

if ($link = $LT_SQL->connect($DBLocation , $DBUsername , $DBPassword, $DBName)) {
  $LT_SQL->query("CALL update_user_pasword($user_id, '$hash', '$salt')");
}

?>
