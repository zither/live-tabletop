<?php // Admin views all messages in a campaign

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$campaign = intval($_REQUEST['campaign']);
$last_message = 0; // show all messages

// Query the Database

if (is_array($rows = LT_call('read_messages', $campaign, $last_message)))
	LT_output_array($rows,
		array('integer' => array('id', 'user_id', 'avatar', 'time')));

?>
