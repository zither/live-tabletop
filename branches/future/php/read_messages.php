<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$last_message = $LT_SQL->real_escape_string($_REQUEST['last_message']);

// Query the Database

$rows = LT_call('read_messages', $table_id, $last_message);

// Generate Output

foreach ($rows as $message) {
	$message['id']      = intval($message['id']);
	$message['user_id'] = intval($message['user_id']);
	$message['time']    = intval($message['time']);
}
include('include/json_headers.php');
echo json_encode($rows);

?>
