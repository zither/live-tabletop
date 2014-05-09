<?php // User loads a map or refreshes an updated map

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

// Query the Database

if (LT_can_view_map($map)) {
	if (is_array($rows = LT_call('read_pieces', $map))) {
		$string_fields = array('image', 'name', 'markers', 'color');
		$float_fields = array('x', 'y');
		foreach ($rows as $i => $fields)
			foreach ($fields as $key => $value)
				if (in_array($key, $float_fields))
					$rows[$i][$key] = floatval($value);
				else if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
