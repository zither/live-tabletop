<?php // User disowns a character or removes a user from a character's owners

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$user = intval($_REQUEST['user']);
$character = intval($_REQUEST['character']);

// Query the Database

if (LT_can_edit_character($character)) 
	LT_call('delete_character_ownrer', $user, $character);

?>
