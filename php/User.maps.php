<?php // User views the maps he owns

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

if (is_array($rows = LT_call('read_maps', $user_id))) {
	$string_fields = array('type', 'name');
	foreach ($rows as $i => $fields)
		foreach ($fields as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
