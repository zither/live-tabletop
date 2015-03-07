<?php // User covers the map with fog

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$map = intval($_REQUEST['map']);
if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); // avoid canceling simultaneous edits
	if ($rows = LT_call('read_map_tiles', $map)) { // get the current map state
		$fog = str_repeat('/', strlen($rows[0]['fog'])); // base64-ish 1s bitstring
		if (is_array(LT_call('update_map_fog', $map, $fog)))
			$LT_SQL->commit(); // save changes
	}
}

?>
