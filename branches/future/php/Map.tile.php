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

// all requests specify a certain tile on a certain map
$map = intval($_REQUEST['map']);
$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
// the remaining request arguments are mutually exclusive
// tile=0 to erase a tile; tile=### to set the tile id to ###
if (isset($_REQUEST['tile'])) {
	$tile_change = TRUE;
	$tile_value = intval($_REQUEST['tile']);
}
// fog=0 to remove fog; fog=1 to add fog
if (isset($_REQUEST['fog'])) {
	$fog_change = TRUE;
	$fog_value = intval($_REQUEST['fog']);
}
// s=none, e=none, se=none, ne=none to erase walls or doors
// s=wall, e=wall, se=wall, ne=wall to create a wall
// s=door, e=door, se=door, ne=door to create a door
foreach (array('s', 'e', 'se', 'ne') as $direction) {
	if (isset($_REQUEST[$direction])) {
		$wall_change = TRUE;
		$wall_direction = $direction;
		$wall_value = $LT_SQL->real_escape_string($_REQUEST[$direction]);
	}
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

// Query the Database

if (LT_can_edit_map($map)) {
	$LT_SQL->autocommit(FALSE); /* avoid canceling simultaneous edits */
	if ($rows = LT_call('read_map_tiles', $map)) {
		$width = intval($rows[0]['tile_columns']);
		$height = intval($rows[0]['tile_rows']);
		$tiles = $rows[0]['tiles'];
		$flags = $rows[0]['flags'];
		// modify tile id
		if ($tile_change && $x >= 0 && $x < $width && $y >= 0 && $y < $height) {
			$tile_array = json_decode($tiles, TRUE);
			$tile_array[$x + $y * $width] = $tile_value;
			$tiles = json_encode($tile_array);
		}
		// modify fog
		if ($fog_change && $x >= 0 && $x < $width && $y >= 0 && $y < $height) {
			$i = ($x + 1) + ($y + 1) * ($width + 1);
			$flag_number = strpos($flags[$i], $code);
			$flag_number %= 27; // remove fog
			if ($fog_value == 1) $flag_number += 27; // add fog
			$flags[$i] = $code[$flag_number];
		}
		// modify wall
		if ($wall_change && $x >= -1 && $x < $width && $y >= -1 && $y < $height) {
			$i = ($x + 1) + ($y + 1) * ($width + 1);
			$flag_number = strpos($flags[$i], $code);
			// break flag number down into components
			$ne = $flag_number % 3;
			$se = ($flag_number - $ne) % 9;
			$s = ($flag_number - $ne - $se) % 27;
			$fog = $flag_number - $ne - $se - $s;
			switch ($wall_direction) {
				case 'ne':
					switch ($wall_value) {
						case 'none': $ne = 0; break;
						case 'wall': $ne = 1; break;
						case 'door': $ne = 2; break;
					}
					break;
				case 'se':
				case 'e':
					switch ($wall_value) {
						case 'none': $se = 0; break;
						case 'wall': $se = 3; break;
						case 'door': $se = 6; break;
					}
					break;
				case 's':
					switch ($wall_value) {
						case 'none': $s = 0; break;
						case 'wall': $s = 9; break;
						case 'door': $s = 18; break;
					}
					break;
			}
			$flags[$i] = $code[$fog + $s + $se + $ne];
		}
		// save changes
		if (LT_call('update_map_tiles', $map, $tiles, $fog)) $LT_SQL->commit();
	}
}

?>
