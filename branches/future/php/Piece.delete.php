<?php // User moves a piece

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

// Interpret the Request

$piece = intval($_REQUEST['piece']);

// Query the Database

if (LT_can_edit_piece($peice))
	LT_call('delete_piece', $piece);

?>
