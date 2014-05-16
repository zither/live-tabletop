<?php // User shares this character with another user

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_REQUEST['user']);
$character = intval($_REQUEST['character']);

// Query the Database

if (LT_can_edit_character($character)) 
	LT_call('create_character_owner', $user, $character);

?>
