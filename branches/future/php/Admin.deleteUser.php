<?php // Admin resets a user's password

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$user = $LT_SQL->real_escape_string($_REQUEST['user']);
LT_call('delete_user', $user);

?>
