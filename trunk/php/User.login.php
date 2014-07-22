<?php // User tries to log in

include('db_config.php');
include('include/query.php');
include('include/password.php');
include('include/output.php');

session_start();

// Interpret the Request

$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

// Query the Database and Generate Output

if ($rows = LT_call_silent('read_user_login', $email)) {
  $hash = LT_hash_password($password, $rows[0]['salt']);
  if (strcmp($hash, $rows[0]['hash']) == 0) {
		// the server associates the user with this session
  	$_SESSION['user'] = $rows[0]['id'];
		// the database remembers that the user logged in
		LT_call('update_user_logged_in', $rows[0]['id'], 1);
		// return the user as a json object
		LT_output_object($rows[0], array(
			'boolean' => array('subscribed'),
			'integer' => array('id'),
			'blocked' => array('hash', 'salt')));
		exit();
  }
}

// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

header('HTTP/1.1 401 Unauthorized', true, 401);
exit("Invalid username or password.");

?>

