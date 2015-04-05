<?php // User creates a new character

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
$system = $LT_SQL->real_escape_string($_REQUEST['system']);

// Query the Database

$rows = LT_call('create_character', $user, $name, $system);
include('include/json_headers.php');
echo json_encode(array('id' => $rows[0]['id']));

?>
