<?php // Admin views all users

include('db_config.php');
include('include/query.php');
include('include/password.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Query the Database

if (is_array($rows = LT_call('read_users'))) {
	$string_fields = array('login', 'name', 'color', 'email');
	foreach ($rows as $i => $fields)
		foreach ($fields as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
