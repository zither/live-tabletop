<?php // Admin views all users

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Query the Database

if (is_array($rows = LT_call('read_users')))
	LT_output_array($rows, array(
		'integer' => array('id', 'last_action'),
		'boolean' => array('logged_in', 'subscribed')));

?>
