<?php // User moves a piece

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$piece = intval($_REQUEST['piece']);
if (LT_can_edit_piece($piece))
	LT_call('delete_piece', $piece);

?>
