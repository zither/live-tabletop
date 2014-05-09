<?php // Admin deletes the campaign

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

LT_call('delete_campaign', intval($_REQUEST['campaign']));

?>
