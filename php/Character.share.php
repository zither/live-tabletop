<?php // User shares this character with another user

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
	LT_call('create_character_ownrer', $user, $character);

?>
