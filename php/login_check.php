<?php

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	die ('You are not logged in.');
}

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$rows = LT_call('read_user', $user_id);

// only a DB failure or deleted account will cause this?
if (count($rows) == 0) {
	header('HTTP/1.1 404 Not Found', true, 404);
	die ("User not found.");
}

// Generate Output

include('include/users.php');
LT_write_users($rows);

?>

