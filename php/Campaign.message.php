<?php // User joins a campaign or looks for new messages

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/roll.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = intval($_SESSION['user_id']);
$campaign = intval($_REQUEST['campaign']);
$avatar = intval($_REQUEST['avatar']);
$text = $LT_SQL->real_escape_string(LT_expand_rolls($_REQUEST['text']));

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('create_message', $campaign, $user_id, $avatar, $text);

?>
