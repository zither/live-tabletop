<?php // User modifies the campaign's initiative list

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$turns = $LT_SQL->real_escape_string($_REQUEST['turns']);

// Query the Database

if (LT_can_edit_campaign($campaign))
	LT_call('update_campaign_turns', $campaign, $turns);

?>
