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
$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$fog = $LT_SQL->real_escape_string($_REQUEST['fog']);

// Query the Database

if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); /* avoid canceling simultaneous edits */
	if ($rows = LT_call('read_map_tiles', $map)) {
		$width = intval($rows[0]['columns']);
		$height = intval($rows[0]['rows']);
		if ($x >= 0 && $x < $width && $y >= 0 && $y < $height) {
			$old_fog = ''; // unpack fog bits one sextuplet at a time
			foreach (str_split($rows[0]['fog']) as $a) $old_fog .= a2b($a);
			$old_fog[$x + $y * $width] = $fog; // change fog state
			$new_fog = ''; // pack new fog bits one sextuplet at a time
			foreach (str_split($old_fog, 6) as $b) $new_fog .= b2a($b);
			if (is_array(LT_call('update_map_fog', $map, $new_fog)))
				$LT_SQL->commit();
		}
	}
}

?>
