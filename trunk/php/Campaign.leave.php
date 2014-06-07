<?php // User checks out of a campaign

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_SESSION['user']);
$campaign = intval($_REQUEST['campaign']);

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('update_campaign_user_leave', $user, $campaign);

?>
