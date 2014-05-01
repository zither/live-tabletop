<?php // User joins a campaign or looks for new messages

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
$last_message_id = $LT_SQL->real_escape_string($_REQUEST['last_message_id']);

// Query the Database

if (LT_can_view_campaign($campaign)) {
	if ($rows = LT_call('read_messages', $campaign, $last_message_id)) {
		$string_fields = array('text');
		foreach ($rows as $i => $message)
			foreach ($message as $key => $value)
				if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
