<?php // Admin resets a user's password

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_REQUEST['user']);

// Query the Database

if ($rows = LT_call('read_friends', $user)) {
	foreach ($rows as $i => $friend) {
		$rows[$i]['sender'] = intval($friend['sender']);
		$rows[$i]['recipient'] = intval($friend['recipient']);
	}
	include('json_headers.php');
	echo json_encode($rows);
}

?>
