<?php // User creates a new campaign

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = intval($_SESSION['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

// Query the Database

$rows = LT_call('create_campaign', $user_id, $name);
include('include/json_headers.php');
echo json_encode(array('id' => intval($rows[0]['id'])));

?>
