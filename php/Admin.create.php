<?php // Admin creates another admin account

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/password.php');

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('create_admin', $login, $hash, $salt);

?>
