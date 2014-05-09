<?php // Admin tries to log in

include('db_config.php');
include('include/query.php');
include('include/password.php');

session_start();

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

// Query the Database and Generate Output

if ($rows = LT_call_silent('read_admin', $login)) {
  $hash = LT_hash_password($password, $rows[0]['salt']);
  if (strcmp($hash, $rows[0]['hash']) == 0) {
    $_SESSION['admin'] = $login;
		exit();
  }
}

// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

header('HTTP/1.1 401 Unauthorized', true, 401);
exit("Invalid username or password.");

?>

