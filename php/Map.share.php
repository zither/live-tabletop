<?php // User shares the map with another user

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$map = intval($_REQUEST['map']);
$user = intval($_REQUEST['user']);

// Query the Database

if (LT_can_edit_map($map)) LT_call('create_map_owner', $map, $user);

?>
