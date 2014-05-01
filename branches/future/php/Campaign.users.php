<?php // User views the owners, members, viewers and blacklist of this campaign

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);

// Query the Database

if (LT_can_view_campaign($campaign)) {
	if ($rows = LT_call('read_campaign_users', $campaign)) {
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
