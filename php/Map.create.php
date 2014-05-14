<?php // User creates a new map

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = intval($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);
$rows = intval($_REQUEST['rows']);
$columns = intval($_REQUEST['columns']);
$tile = intval($_REQUEST['tile']);
$background = $LT_SQL->real_escape_string($_REQUEST['background']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

$tiles = json_encode(array_fill(0, $rows * $columns, $tile));
$flags = str_repeat('0', ($rows + 1) * ($columns + 1));

// Query the Database

$rows = LT_call('create_map', $user_id, $type, $rows, $columns, $background,
	$name, $tiles, $flags);

include('include/json_headers.php');
echo json_encode(array('id' => intval($rows[0]['id'])));

?>
