<?php // User stops being friends with the recipient or cancels a friend request

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$sender = intval($_SESSION['user']);
$recipient = $LT_SQL->real_escape_string($_REQUEST['recipient']);

// Query the Database

LT_call('delete_friend', $sender, $recipient);

?>
