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

// convert base64 character a to binary string b
function a2b($a) {
	global $base64;
	$a = strpos($base64, $a);
	$b = '000000';
	if ($a & 1) $b[5] = '1';
	if ($a & 2) $b[4] = '1';
	if ($a & 4) $b[3] = '1';
	if ($a & 8) $b[2] = '1';
	if ($a & 16) $b[1] = '1';
	if ($a & 32) $b[0] = '1';
	return $b;
}

// convert binary string b to base64 character a
function b2a($b) {
	global $base64;
	$b = str_pad($b, 6, '0', STR_PAD_RIGHT);
	$a = 0;
	if ($b[5] === '1') $a += 1;
	if ($b[4] === '1') $a += 2;
	if ($b[3] === '1') $a += 4;
	if ($b[2] === '1') $a += 8;
	if ($b[1] === '1') $a += 16;
	if ($b[0] === '1') $a += 32;
	return $base64[$a];
}

// Interpret the Request

$map = intval($_REQUEST['map']);
$left = intval($_REQUEST['left']);
$top = intval($_REQUEST['top']);
$right = intval($_REQUEST['right']);
$bottom = intval($_REQUEST['bottom']);
$tile = intval($_REQUEST['tile']);
$tile = $base64[$tile / 64 % 64] . $base64[$tile % 64];

// Query the Database

if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); /* avoid canceling simultaneous edits */
	if ($rows = LT_call('read_map_tiles', $map)) {

		// get old tiles, walls and fog
		$old_width  = intval($rows[0]['columns']);
		$old_height = intval($rows[0]['rows']);
		$old_tiles  = str_split($rows[0]['tiles'], $old_width * 2);
		$old_walls  = str_split($rows[0]['walls'], $old_width + 2);
		$old_fog    = ''; // unpack fog bits one sextuplet at a time
		foreach (str_split($rows[0]['fog']) as $a) $old_fog .= a2b($a);
		$old_fog    = str_split($old_fog, $old_width);

		// create new tiles, walls and fog
		$new_width  = $right - $left;
		$new_height = $bottom - $top;
		$new_tiles  = array_fill(0, $new_height, str_repeat($tile, $new_width));
		$new_walls  = array_fill(0, $new_height + 1, str_repeat('A', $new_width + 2));
		$new_fog    = array_fill(0, $new_height, str_repeat('0', $new_width));

		// copy old tiles over new tiles
		$old_x = max(0, $left); $new_x = $old_x - $left;
		$old_y = max(0, $top);  $new_y = $old_y - $top;
		$length = min($old_width, $right) - $old_x;
		$last_row = min($old_height, $bottom);
		for (; $old_y <= $last_row; $old_y++, $new_y++) {
			$new_walls[$new_y] = substr_replace($new_walls[$new_y],
				substr($old_walls[$old_y], $old_x, $length + 2),
				$new_x, $length + 2);
			if ($old_y == $last_row) break;
			$new_tiles[$new_y] = substr_replace($new_tiles[$new_y],
				substr($old_tiles[$old_y], $old_x * 2, $length * 2),
				$new_x * 2, $length * 2);
			$new_fog[$new_y] = substr_replace($new_fog[$new_y],
				substr($old_fog[$old_y], $old_x, $length),
				$new_x, $length);
		}

		// remove walls outside the map
		if ($rows[0]['type'] == 'hex')
			// remove SW and SE walls from first row of odd numbered columns
			for ($x = 1; $x < $new_width + 2; $x += 2)
				$new_walls[0][$x] = $base64[strpos($base64, $new_walls[0][$x]) & 12];
		else // remove E walls from first row
			for ($x = 0; $x < $new_width + 2; $x ++)
				$new_walls[0][$x] = $base64[strpos($base64, $new_walls[0][$x]) & 12];
		for ($x = $new_width + 1, $y = 0; $y < $new_height + 1; $y++) {
			// remove SW and S walls from left column
			$new_walls[$y][0] = $base64[strpos($base64, $new_walls[$y][0]) & 3];
			// remove S and SE or E walls from right column
			$new_walls[$y][$x] = $base64[strpos($base64, $new_walls[$y][$x]) & 48];
		}

		// save the changes
		$b64fog = ''; // pack new fog bits one sextuplet at a time
		foreach (str_split(implode($new_fog), 6) as $b) $b64fog .= b2a($b);
		if (LT_call('update_map_size', $map, $left, $top, $right, $bottom,
			implode($new_tiles), implode($new_walls), $b64fog)) $LT_SQL->commit();
	}
}

?>
