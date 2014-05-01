<?php // User joins a campaign or looks for new messages

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/roll.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$avatar = $LT_SQL->real_escape_string($_REQUEST['avatar']);
$text = $LT_SQL->real_escape_string(LT_expand_rolls($_REQUEST['text']));

// Query the Database

if (LT_can_view_campaign($campaign))
	LT_call('create_message', $campaign, $user_id, $avatar, $text);

?>
