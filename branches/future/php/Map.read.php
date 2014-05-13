<?php // User loads a map or refreshes an updated map

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$map = intval($_REQUEST['map']);

// Query the Database

if (LT_can_view_map($map)) {
	if ($rows = LT_call('read_map', $map)) {
		$strings = array('name', 'type', 'grid_color', 'wall_color', 'door_color', 'fog');
		$floats = array('min_zoom', 'max_zoom');
		$json = array('background', 'tiles');
		foreach ($rows as $i => $fields)
			foreach ($fields as $key => $value)
				if (in_array($key, $floats)) $rows[$i][$key] = floatval($value);
				else if (in_array($key, $json)) $rows[$i][$key] = json_decode($value);
				else if (!in_array($key, $strings)) $rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
