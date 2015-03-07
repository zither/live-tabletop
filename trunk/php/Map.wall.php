<?php // User paints or erases tiles, fog or walls

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
$place_factors = array('sw' => 16, 's' => 4, 'se' => 1, 'e' => 1);
$flags = array('none' => 0, 'wall' => 1, 'door' => 2, 'open' => 3);

// Interpret the Request

$map = intval($_REQUEST['map']);
$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$side = $LT_SQL->real_escape_string($_REQUEST['side']); // s|e|sw|se
$type = $LT_SQL->real_escape_string($_REQUEST['type']); // none|wall|door|open

// Query the Database

if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); /* avoid canceling simultaneous edits */
	if ($rows = LT_call('read_map_tiles', $map)) {
		$width = intval($rows[0]['columns']);
		$height = intval($rows[0]['rows']);
		if ($x >= 0 && $x < $width + 2 && $y >= 0 && $y < $height + 1) {
			$i = $x + $y * ($width + 2);
			$walls = $rows[0]['walls'];
			$wall = strpos($base64, $walls[$i]);
			$place = $place_factors[$side];
			$wall -= $wall & ($place * 3); // clear old flags
			$wall += $place * $flags[$type]; // apply new flags
			$walls[$i] = $base64[$wall];
			if (is_array(LT_call('update_map_walls', $map, $walls)))
				$LT_SQL->commit();
		}
	}
}

?>
