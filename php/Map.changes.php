<?php // User polls for changes to the map, pieces and tiles

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$map = intval($_REQUEST['map']);

// Query the Database

if (LT_can_view_map($map)) {
	if ($rows = LT_call('read_map_changes', $map)) {
		$strings = array('name', 'type', 'grid_color', 'wall_color', 'door_color', 'fog');
		$floats = array('min_zoom', 'max_zoom');
		$json = array('background', 'tiles');
		foreach ($rows as $i => $fields)
			foreach ($fields as $key => $value)
				if (in_array($key, $floats)) $rows[$i][$key] = floatval($value);
				else if (in_array($key, $json)) $rows[$i][$key] = json_decode($value);
				else if (!in_array($key, $strings)) $rows[$i] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
