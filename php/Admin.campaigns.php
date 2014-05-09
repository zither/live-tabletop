<?php // Admin resets a user's password

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Query the Database

if (is_array($rows = LT_call('read_campaigns'))) {
	foreach ($rows as $i => $campaign)
		$rows[$i]['id'] = intval($campaign['id']);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
