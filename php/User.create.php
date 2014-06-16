<?php // User creates a new account for himself

include('db_config.php');
include('include/query.php');
include('include/password.php');
include('include/output.php');

session_start();

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);
$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$subscribed = intval($_REQUEST['subscribed']); // 0 or 1

$salt = LT_random_salt();
$hash = LT_hash_password($password, $salt);

// Query the Database

// don't create a new user if one with this login already exists
if ($rows = LT_call_silent('read_user_login', $login)) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit("Invalid username or password.");
}
// otherwise create a new user and login immediately
else {
	$rows = LT_call('create_user', $login, $hash, $salt, $email, $subscribed);
	// the server associates the user with this session
	$_SESSION['user'] = $rows[0]['id'];
	// return the user as a json object
	LT_output_object($rows[0], array(
		'boolean' => array('subscribed'),
		'integer' => array('id', 'last_action')));
}

?>
