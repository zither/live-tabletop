<?php // Admin resets a user's password

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

// Query the Database

if ($rows = LT_call('read_campaigns')) {
	foreach ($rows as $i => $campaign)
		$rows[$i]['campaign_id'] = intval($campaign['campaign_id']);
	include('json_headers.php');
	echo json_encode($rows);
}

?>
