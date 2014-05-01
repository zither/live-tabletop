<?php // Admin views all messages in a campaign

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$last_message_id = 0; // show all messages

// Query the Database

if ($rows = LT_call('read_messages', $campaign, $last_message_id)) {
	$string_fields = array('text');
	foreach ($rows as $i => $message)
		foreach ($message as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('include/json_headers.php');
	echo json_encode($rows);
}

?>
