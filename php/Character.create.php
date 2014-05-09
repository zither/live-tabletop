<?php // User creates a new character

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request
// TODO: do we really need to initialize all these fields?

$user = intval($_SESSION['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$system = $LT_SQL->real_escape_string($_REQUEST['system']);
$stats = $LT_SQL->real_escape_string($_REQUEST['stats']);
$notes = $LT_SQL->real_escape_string($_REQUEST['notes']);
$portrait = $LT_SQL->real_escape_string($_REQUEST['portrait']);
$piece = $LT_SQL->real_escape_string($_REQUEST['piece']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);

// Query the Database

LT_call('create_character',
	$user, $name, $system, $stats, $notes, $portrait, $piece, $color);

?>
