<?php // User views campaigns he owns and campaigns he has been invited to

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

if ($rows = LT_call('read_campaign_user_campaigns', $campaign)) {
	foreach ($rows as $i => $campaign)
		$rows[$i]['campaign_id'] = intval($campaign['campaign_id']);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
