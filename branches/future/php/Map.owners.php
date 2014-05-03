<?php // User disowns a map or removes another user from the map's owners

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

// Interpret the Request

$map = intval($_REQUEST['map']);

// Query the Database

if (LT_can_edit_map($map)) {
	if ($rows = LT_call('read_map_owners', $map)) {
		$string_fields = array('login', 'name', 'color');
		foreach ($rows as $i => $fields)
			foreach ($fields as $key => $value)
				if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
