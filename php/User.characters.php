<?php // User views a list of characters he owns

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_SESSION['user_id']);

// Query the Database

if (is_array($rows = LT_call('read_characters', $user))) {
	foreach($rows as $i => $fields)
		$rows[$i]['id'] = intval($fields['id']);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
