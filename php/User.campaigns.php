<?php // User views campaigns he owns and campaigns he has been invited to

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

if (is_array($rows = LT_call('read_campaign_user_campaigns', $user_id))) {
	foreach ($rows as $i => $campaign)
		$rows[$i]['campaign_id'] = intval($campaign['campaign_id']);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
