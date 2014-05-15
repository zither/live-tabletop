<?php // User disowns a character or removes a user from a character's owners

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}
// Interpret the Request

$user = intval($_REQUEST['user']);
$character = intval($_REQUEST['character']);

// Query the Database

if (LT_can_edit_character($character)) 
	LT_call('delete_character_owner', $user, $character);

?>
