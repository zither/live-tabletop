<?php // User renames the campaign

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

// Query the Database

if (LT_can_edit_campaign($campaign))
	LT_call('update_campaign_name', $campaign, $name);

?>
