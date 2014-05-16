<?php // User modifies a piece's settings

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$piece = intval($_REQUEST['piece']);
$image = $LT_SQL->real_escape_string($_REQUEST['image']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$character = intval($_REQUEST['character']);
$markers = $LT_SQL->real_escape_string($_REQUEST['markers']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);

// Query the Database

if (LT_can_edit_piece($piece))
	LT_call('update_piece', $piece, $image, $name, $character, $markers, $color);

?>
