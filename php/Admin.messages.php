<?php // Admin views all messages in a campaign

include('db_config.php');
include('include/query.php');

session_start();
if (!isset($_SESSION['admin'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$last_message_id = 0; // show all messages

// Query the Database

if (is_array($rows = LT_call('read_messages', $campaign, $last_message_id))) {
	$string_fields = array('text');
	foreach ($rows as $i => $message)
		foreach ($message as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
