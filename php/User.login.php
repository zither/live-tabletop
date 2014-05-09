<?php // User tries to log in

session_start();

include('db_config.php');
include('include/query.php');
include('include/password.php');

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

// Query the Database and Generate Output

if ($rows = LT_call_silent('read_user_login', $login)) {
  $hash = LT_hash_password($password, $rows[0]['salt']);
  if (strcmp($hash, $rows[0]['hash']) == 0) {
		// the server associates the user with this session
  	$_SESSION['user_id'] = $rows[0]['id'];
		// the database remembers that the user logged in
		LT_call('update_user_logged_in', $rows[0]['id'], 1);
		// return the user as a json object
		unset($rows[0]['hash']);
		unset($rows[0]['salt']);
		$rows[0]['id'] = intval($rows[0]['id']);
		$rows[0]['last_action'] = intval($rows[0]['last_action']);
		$rows[0]['subscribed'] = intval($rows[0]['subscribed']);
		include('include/json_headers.php');
  	echo json_encode($rows[0]);
		exit();
  }
}

// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

header('HTTP/1.1 401 Unauthorized', true, 401);
exit("Invalid username or password.");

?>

