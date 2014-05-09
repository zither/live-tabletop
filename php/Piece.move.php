<?php // User moves a piece

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$piece = intval($_REQUEST['piece']);
$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);

// Query the Database

if (LT_can_edit_piece($peice))
	LT_call('update_piece_position', $piece, $x, $y);

?>
