<?php // User sees his lists of friends and friend requests

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$friends = array('recieved' => array(), 'requested' => array(), 'confirmed' => array());
foreach (LT_call('read_friends_recieved', $user_id) as $row)
	$friends['recieved'][] = intval($row['sender']);
foreach (LT_call('read_friends_requested', $user_id) as $row)
	$friends['requested'][] = intval($row['recipient']);
foreach (LT_call('read_friends_confirmed', $user_id) as $row)
	$friends['confirmed'][] = intval($row['user_id']);
include('include/json_headers.php');
echo json_encode($friends);

?>
