<?php // User shows his cursor's position on the map to other players

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$user = intval($_SESSION['user']);
$campaign = intval($_REQUEST['campaign']);
$cursor = json_encode(array(
	'x' => floatval($_REQUEST['x']),
	'y' => floatval($_REQUEST['y']),
	'time' => time()));

LT_call('update_campaign_user_cursor', $user, $campaign, $cursor);

?>
