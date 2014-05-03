<?php // User views a list of this character's owners

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$character = intval($_REQUEST['character']);

// Query the Database

if (LT_can_view_character($character)) {
	if ($rows = LT_call('read_character_owners', $character)) {
		$string_fields = array('login', 'name', 'color');
		foreach($rows as $i => $fields)
			foreach($fields as $key => $value)
				if (!in_array($key, $string_fields))
					$rows[$i][$key] = intval($value);
		include('include/json_headers.php');
		echo json_encode($rows);
	}
}

?>
