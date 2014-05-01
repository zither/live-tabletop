<?php // User checks in to a campaign

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('update_campaign_user_arrive', $user_id, $campaign);

?>
