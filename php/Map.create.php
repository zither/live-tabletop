<?php // User creates a new map

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_SESSION['user']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);
$rows = intval($_REQUEST['rows']);
$columns = intval($_REQUEST['columns']);
$tile = intval($_REQUEST['tile']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

$tiles = str_repeat('A', $columns * $rows * 2);
$walls = str_repeat('A', ($columns + 2) * ($rows + 1));
$fog = str_repeat('A', ceil($columns * $rows / 6));

// Query the Database

$rows = LT_call('create_map',
	$user, $type, $rows, $columns, $name, $tiles, $walls, $fog);

include('include/json_headers.php');
echo json_encode(array('id' => intval($rows[0]['id'])));

?>
