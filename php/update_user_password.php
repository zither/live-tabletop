<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/users.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['id']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('update_user_password', $user_id, $hash, $salt);

?>
