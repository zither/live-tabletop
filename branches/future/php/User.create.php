<?php // User creates a new account for himself

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

include('db_config.php');
include('include/query.php');
include('include/password.php');

// Interpret the Request

$login       = $LT_SQL->real_escape_string($_REQUEST['login']);
$password    = $LT_SQL->real_escape_string($_REQUEST['password']);
$permissions = $LT_SQL->real_escape_string($_REQUEST['permissions']);
$email       = $LT_SQL->real_escape_string($_REQUEST['email']);
$subscribed  = $LT_SQL->real_escape_string($_REQUEST['subscribed']); // 0 or 1

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('create_user', $login, $hash, $salt, $email, $subscribed);
// TODO: immediately login new user?

?>
