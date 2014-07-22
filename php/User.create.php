<?php // User creates a new account for himself

include('db_config.php');
include('include/query.php');
include('include/password.php');
include('include/output.php');

session_start();

// Interpret the Request
$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$subscribed = intval($_REQUEST['subscribed']); // 0 or 1

// Query the Database
if ($rows = LT_call_silent('read_user_login', $email)) {

	// don't create a new user if one with this email already exists
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit("You may not create an account with this e-mail address.");

} else {

	// create a new user and return the user id
	$reset_code = LT_random_salt();
	$unsubscribe_code = LT_random_salt();
	$rows = LT_call('create_user',
		$email, $reset_code, $subscribed, $unsubscribe_code);
	LT_output_object($rows[0], array('integer' => array('id')));

	// compose and send the confirmation e-mail
	$subject = "Welcome to Live Tabletop";
	$message =
		wordwrap("Click on this link to activate your Live Tabletop account.", 70)
		. "\r\nhttp://{$_SERVER['HTTP_HOST']}"
		. str_replace("/php/User.create.php", "", $_SERVER['REQUEST_URI'])
		. "?resetCode=$reset_code&email=$email";
	mail($email, $subject, $message);

}

?>
