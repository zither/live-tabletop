<?php // User sends or accepts a friend request

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$sender = $LT_SQL->real_escape_string($_SESSION['user_id']);
$recipient = $LT_SQL->real_escape_string($_REQUEST['recipient']);

// Query the Database

LT_call('create_friend', $sender, $recipient);

?>
