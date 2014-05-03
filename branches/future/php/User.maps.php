<?php // User views the maps he owns

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

if ($rows = LT_call('read_maps', $user_id)) {
	$string_fields = array('type', 'name');
	foreach ($rows as $i => $fields)
		foreach ($fields as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
