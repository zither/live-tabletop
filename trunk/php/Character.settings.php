<?php // User modifies a character

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$character = intval($_REQUEST['character']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$system = $LT_SQL->real_escape_string($_REQUEST['system']);
$stats = $LT_SQL->real_escape_string($_REQUEST['stats']);
$notes = $LT_SQL->real_escape_string($_REQUEST['notes']);
$portrait = $LT_SQL->real_escape_string($_REQUEST['portrait']);
$piece = $LT_SQL->real_escape_string($_REQUEST['piece']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);

// Query the Database

if (LT_can_edit_character($character)) LT_call('update_character',
	$character, $name, $system, $stats, $notes, $portrait, $piece, $color);

?>
