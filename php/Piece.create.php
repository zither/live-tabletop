<?php // User creates a new piece

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

// Interpret the Request

$map = intval($_REQUEST['map']);
$image = $LT_SQL->real_escape_string($_REQUEST['image']);

// Query the Database

if (LT_can_edit_map($map))
	LT_call('create_piece', $map, $image);

?>
