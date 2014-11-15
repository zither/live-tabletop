<?php /* User disowns the campaign
or User revokes a user's ownership or membership
or User removes a user from the campaign's blacklist */

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_REQUEST['user']);
$campaign = intval($_REQUEST['campaign']);

// Query the Database

if (LT_can_edit_campaign($campaign))
	LT_call('delete_campaign_user', $user, $campaign);

?>
