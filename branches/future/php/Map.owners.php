<?php // User disowns a map or removes another user from the map's owners

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

if (LT_can_edit_map($map)) {
	if (is_array($rows = LT_call('read_map_owners', $map))) {
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
