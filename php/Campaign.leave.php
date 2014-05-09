<?php // User checks out of a campaign

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('update_campaign_user_leave', $user_id, $campaign);

?>
