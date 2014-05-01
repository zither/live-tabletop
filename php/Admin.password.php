<?php // Admin changes his password

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/password.php');

// Interpret the Request

$login = $LT_SQL->real_escape_string($_SESSION['admin']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('update_admin_password', $login, $hash, $salt);

?>
