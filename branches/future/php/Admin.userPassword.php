<?php // Admin resets a user's password

include('db_config.php');
include('include/query.php');
include('include/password.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = $LT_SQL->real_escape_string($_REQUEST['user']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

LT_call('update_user_password', $user, $hash, $salt);

?>
