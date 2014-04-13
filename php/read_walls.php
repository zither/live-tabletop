<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$rows = LT_call('read_walls', $table_id);
foreach ($rows as $i => $wall) {
	// convert numbers from strings to integers
	$rows[$i]['x'] = intval($wall['x']);
	$rows[$i]['y'] = intval($wall['y']);
}

// Generate Output

include('include/json_headers.php');
echo json_encode($rows);

?>
