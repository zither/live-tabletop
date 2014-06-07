<?php // User opens Live Tabletop and might already be logged in.

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

if ($rows = LT_call_silent('read_user', $_SESSION['user']))
	LT_output_object($rows[0], array(
		'boolean' => array('subscribed'),
		'integer' => array('id'),
		'blocked' => array('logged_in')));
?>

