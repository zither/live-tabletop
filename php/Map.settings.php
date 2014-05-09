<?php // User paints, erases or toggles fog on a tile

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

// Interpret the Request

$map = intval($_REQUEST['map']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);
$background = $LT_SQL->real_escape_string($_REQUEST['background']);
$min_zoom = floatval($_REQUEST['min_zoom']);
$max_zoom = floatval($_REQUEST['max_zoom']);
$min_rotate = intval($_REQUEST['min_rotate']);
$max_rotate = intval($_REQUEST['max_rotate']);
$min_tilt = intval($_REQUEST['min_tilt']);
$max_tilt = intval($_REQUEST['max_tilt']);
$grid_thickness = intval($_REQUEST['grid_thickness']);
$grid_color = $LT_SQL->real_escape_string($_REQUEST['grid_color']);
$wall_thickness = intval($_REQUEST['wall_thickness']);
$wall_color = $LT_SQL->real_escape_string($_REQUEST['wall_color']);
$door_thickness = intval($_REQUEST['door_thickness']);
$door_color = $LT_SQL->real_escape_string($_REQUEST['door_color']);

// Query the Database

if (LT_can_edit_map($map)) 
	LT_call('update_map', $map, $type, $background, $min_zoom, $max_zoom,
		$min_rotate, $max_rotate, $min_tilt, $max_tilt, $grid_thickness,
		$grid_color, $wall_thickness, $wall_color, $door_thickness, $door_color);

?>
