<?php // User paints or erases tiles, fog or walls

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$map = intval($_REQUEST['map']);
$left = intval($_REQUEST['left']);
$top = intval($_REQUEST['top']);
$right = intval($_REQUEST['right']);
$bottom = intval($_REQUEST['bottom']);
$tile_id = intval($_REQUEST['tile']);
$flags_char = $LT_SQL->real_escape_string($_REQUEST['flags']);

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

// Query the Database

if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); /* avoid canceling simultaneous edits */
	if ($rows = LT_call('read_map_tiles', $map)) {
		// get old tiles and flags
		$old_width  = intval($rows[0]['tile_columns']);
		$old_height = intval($rows[0]['tile_rows']);
		$old_tiles  = array_chunk(json_decode($rows[0]['tiles']), $old_width);
		$old_flags  = str_split($rows[0]['flags'], $old_width + 1);
		// create new tiles and flags
		$new_width  = $right - $left;
		$new_height = $bottom - $top;
		$new_tiles  = array_fill(0, $new_width * $new_height, $tile_id);
		$new_flags  = str_repeat($flags_char, ($new_width + 1) * ($new_height + 1));
		// copy old tiles over new tiles
		$start = max(0, $left);
		$length = min($old_width, $right) - $start;
		for ($old_y = max(0, $top); $old_y < min($old_height, $bottom); $old_y++)
			array_splice($new_tiles, ($start - $left) + ($old_y - $top) *  $new_width,
				$length, array_slice($old_tiles[$old_y], $start, $length));
		// copy old flags over new flags
		for (/*$start -= 1,*/ $length += 1, $old_y = max(0, $top);
			$old_y < min($old_height, $bottom) + 1; $old_y++)
				$new_flags = substr_replace($new_flags,
					substr($old_flags[$old_y], $start, $length),
					($start - $left + 1) + ($old_y - $top + 1) * ($new_width + 1),
					$length);
		// remove fog outside the map
		// TODO: remove walls outside the map
		for ($i = 0; $i < $new_width + 1; $i++)
			$new_flags[$i] = $code[strpos($code, $new_flags[$i]) % 27];
		for ($i = $new_width + 1; $i < ($new_width + 1) * ($new_height + 1);
			$i += $new_width + 1)
				$new_flags[$i] = $code[strpos($code, $new_flags[$i]) % 27];
		// save the changes
		if (LT_call('update_map_size', $map, $left, $top, $right, $bottom,
			json_encode($new_tiles), $new_flags)) $LT_SQL->commit();
	}
}

?>
