<?php // User views the owners, members, viewers and blacklist of this campaign

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

// Query the Database

if (LT_can_view_campaign($campaign)) {
	if (is_array($rows = LT_call('read_campaign_users', $campaign))) {
		$string_fields = array('permission', 'login', 'name');
		foreach ($rows as $i => $table)
			foreach ($table as $key => $value)
				if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
