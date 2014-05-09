<?php // User creates a new account for himself

include('db_config.php');
include('include/query.php');
include('include/password.php');

session_start();

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$subscribed = $LT_SQL->real_escape_string($_REQUEST['subscribed']); // 0 or 1

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('create_user', $login, $hash, $salt, $email, $subscribed);
// TODO: immediately login new user?

?>
