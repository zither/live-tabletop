<?php // User updates his account information

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_SESSION['user']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);
$subscribed = intval($_REQUEST['subscribed']);

// Query the Database

LT_call('update_user', $user, $subscribed, $name, $color);

?>
