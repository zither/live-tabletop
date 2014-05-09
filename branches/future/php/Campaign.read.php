<?php // User loads a campaign or polls for messages and changes

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$campaign = intval($_REQUEST['campaign']);

// Query the Database

if (LT_can_view_campaign($campaign)) {
	$rows = LT_call('read_campaign', $campaign);
	$rows[0]['id'] = intval($rows[0]['id']);
	$rows[0]['map'] = intval($rows[0]['map']);
	$rows[0]['private'] = $rows[0]['private'] == '1' ? TRUE : FALSE;
	$rows[0]['turns'] = json_decode($rows[0]['turns']);
	$rows[0]['last_message'] = intval($rows[0]['last_message']);
	$rows[0]['users_modified'] = intval($rows[0]['users_modified']);
	include('include/json_headers.php');
	echo json_encode($rows[0]);
}

?>
