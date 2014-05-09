<?php // User modifies the campaign's initiative list

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}
// Interpret the Request

$campaign = intval($_REQUEST['campaign']);
$turns = $LT_SQL->real_escape_string($_REQUEST['turns']);

// Query the Database

if (LT_can_edit_campaign($campaign))
	LT_call('update_campaign_turns', $campaign, $turns);

?>
