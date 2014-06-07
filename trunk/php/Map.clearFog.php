<?php // User clears all the fog from the map

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// symbol  0ABCDEFGHIJKLMNOPQRSTUVWXYZ1abcdefghijklmnopqrstuvwxyz
// fog                                ***************************
// S wall           *********                  *********
// S door                    *********                  *********
// E wall     ***      ***      ***      ***      ***      ***   
// E door        ***      ***      ***      ***      ***      ***
// SE wall    ***      ***      ***      ***      ***      ***   
// SE door       ***      ***      ***      ***      ***      ***
// NE wall  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
// NE door   *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
$code = "0ABCDEFGHIJKLMNOPQRSTUVWXYZ1abcdefghijklmnopqrstuvwxyz";
$map = intval($_REQUEST['map']);
if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); // avoid canceling simultaneous edits
	// get the current state of the map
	if ($rows = LT_call('read_map_tiles', $map)) {
		$tiles = $rows[0]['tiles'];
		$flags = $rows[0]['flags'];
		// modify fog
		for ($i = 0; $i < strlen($flags); $i++)
			$flags[$i] = $code[strpos($code, $flags[$i]) % 27];
		// save changes
		if (is_array(LT_call('update_map_tiles', $map, $tiles, $flags)))
			$LT_SQL->commit();
	}
}

?>
