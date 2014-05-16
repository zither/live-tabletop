<?php // Admin views all friend requests sent and received by the user

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

if (is_array($rows = LT_call('read_friends', intval($_REQUEST['user']))))
	LT_output_array($rows, array('integer' => array('sender', 'recipient')));

?>
