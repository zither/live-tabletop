<?php

session_start();

include('db_config.php');
include('include/query.php');

// Interpret the Request

$username = $LT_SQL->real_escape_string($_REQUEST['username']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

// Query the Database and Generate Output

include('include/users.php');
if ($rows = LT_call_silent('read_user_by_name', $username)) {
  $hash = LT_hash_password($password, $rows[0]['password_salt']);
  if (strcmp($hash, $rows[0]['password_hash']) == 0) {
    // Save session variables that only the server can modify.
    $_SESSION['user_id'] = $rows[0]['id'];
    $_SESSION['permissions'] = $rows[0]['permissions'];
    // Write a json array containing the user
    LT_write_users($rows);
	exit();
  }
}

// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

header('HTTP/1.1 401 Unauthorized', true, 401);
exit("Invalid username or password.");

?>

