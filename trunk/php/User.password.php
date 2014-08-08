<?php // User changes his password

include('db_config.php');
include('include/query.php');
include('include/password.php');

session_start();
if (isset($_SESSION['user'])) {
	// if you are logged in, use the current session's user id
	$user = intval($_SESSION['user']);
} else if (isset($_REQUEST['resetCode']) and isset($_REQUEST['email'])) {
	// if you are not logged in, check for a valid password reset code
	$resetCode = $LT_SQL->real_escape_string($_REQUEST['resetCode']);
	$email = $LT_SQL->real_escape_string($_REQUEST['email']);
	$rows = LT_call('read_user_reset_code', $email);
	if ($rows and $rows[0]['reset_code'] == $resetCode)
		$user = intval($rows[0]['id']);
}

if (!isset($user)) {
	// you are not logged in and did not provide a valid reset code
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

LT_call('update_user_password', $user, $hash, $salt);

?>
