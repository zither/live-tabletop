<?php

session_start();
// if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);

// Query the Database

$rows = LT_call('read_images', $type);

// Generate Output

// convert number strings to integers
$string_fields = array('file', 'type', 'tile_mode');
foreach ($rows as $i => $fields)
	foreach ($fields as $key => $value)
		if (!in_array($key, $string_fields))
			$rows[$i][$key] = intval($value);

// output json
include('include/json_headers.php');
echo json_encode($rows);

?>
