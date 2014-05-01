<?php // User sees his lists of friends and friend requests

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$recieved = array();
foreach (LT_call('read_friends_recieved', $user_id) as $row)
	$recieved[] = $row['sender'];

$requested = array();
foreach (LT_call('read_friends_requested', $user_id) as $row)
	$requested[] = $row['recipient'];

$confirmed = array();
foreach (LT_call('read_friends_confirmed', $user_id) as $row)
	$confirmed[] = $row['user_id'];

include('include/json_headers.php');
echo json_encode(array(
	'recieved' => $recieved,
	'requested' => $requested,
	'confirmed' => $requested
));

?>
