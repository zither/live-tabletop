<?php // User views campaigns he owns and campaigns he has been invited to

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$user_id = intval($_SESSION['user_id']);
if (is_array($rows = LT_call('read_campaign_user_campaigns', $user_id)))
	LT_output_array($rows, array('integer' => array('campaign_id')));

?>
