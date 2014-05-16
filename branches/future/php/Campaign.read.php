<?php // User loads a campaign or polls for messages and changes

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$campaign = intval($_REQUEST['campaign']);
if (LT_can_view_campaign($campaign))
	if ($rows = LT_call('read_campaign', $campaign))
		LT_output_object($rows[0], array(
			'integer' => array ('id', 'map', 'last_message', 'users_modified'),
			'boolean' => array ('private'),
			'json' => array ('turns')));

?>
