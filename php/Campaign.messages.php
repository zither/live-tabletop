<?php // User joins a campaign or looks for new messages

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$campaign = intval($_REQUEST['campaign']);
$last_message_id = intval($_REQUEST['last_message_id']);

// Query the Database

if (LT_can_view_campaign($campaign)) {
	if (is_array($rows = LT_call('read_messages', $campaign, $last_message_id))) {
		$string_fields = array('text');
		foreach ($rows as $i => $fields)
			foreach ($fields as $key => $value)
				if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
