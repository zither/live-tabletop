<?php // User selects his avatar for this campaign

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
$avatar = intval($_REQUEST['avatar']);

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('update_campaign_user_avatar', $user, $campaign, $avatar);

?>
