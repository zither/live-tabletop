<?php // User sees his lists of friends and friend requests

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$user = intval($_SESSION['user']);

$recieved = LT_call('read_friends_received', $user);
$requested = LT_call('read_friends_requested', $user);
$confirmed = LT_call('read_friends_confirmed', $user);
foreach ($recieved as $row) LT_format_object($row, array('integer' => array('id')));
foreach ($confirmed as $row) LT_format_object($row, array('integer' => array('id')));
include('include/json_headers.php');
echo json_encode(array('received' => $recieved, 'requested' => $requested, 'confirmed' => $confirmed));

?>
