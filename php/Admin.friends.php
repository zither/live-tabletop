<?php // Admin views all friend requests sent and received by the user

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_REQUEST['user']);

// Query the Database

if (is_array($rows = LT_call('read_friends', $user))) {
	foreach ($rows as $i => $friend) {
		$rows[$i]['sender'] = intval($friend['sender']);
		$rows[$i]['recipient'] = intval($friend['recipient']);
	}
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
