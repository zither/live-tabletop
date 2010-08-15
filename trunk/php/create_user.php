<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

include('db_config.php');
include('include/query.php');
include('include/users.php');

// Interpret the Request

$username = $LT_SQL->real_escape_string($_REQUEST['username']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$permissions = $LT_SQL->real_escape_string($_REQUEST['permissions']);

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('create_user', $username, $hash, $salt, NULL, $permissions);

?>
