<?php // User views a list of characters he owns

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user = intval($_SESSION['user_id']);

// Query the Database

if ($rows = LT_call('read_characters', $user)) {
	foreach($rows as $i => $fields)
		$rows[$i]['id'] = intval($fields['id']);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
