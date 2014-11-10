<?php // User sees his lists of friends and friend requests

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$user = intval($_SESSION['user']);

// Query the Database

$friends = array('recieved' => array(), 'requested' => array(), 'confirmed' => array());
foreach (LT_call('read_friends_recieved', $user) as $row)
	$friends['recieved'][] = $row['email'];
foreach (LT_call('read_friends_requested', $user) as $row)
	$friends['requested'][] = $row['email'];
foreach (LT_call('read_friends_confirmed', $user) as $row)
	$friends['confirmed'][] = $row['email'];
include('include/json_headers.php');
echo json_encode($friends);

?>
