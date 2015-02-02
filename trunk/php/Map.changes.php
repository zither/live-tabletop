<?php // User polls for changes to the map, pieces and tiles

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$map = intval($_REQUEST['map']);
if (LT_can_view_map($map))
	if ($rows = LT_call('read_map_changes', $map))
		LT_output_object($rows[0], array(
			'integer' => array('id', 'rows', 'columns',
				'min_rotate', 'max_rotate', 'min_tilt', 'max_tilt',
				'grid_thickness', 'wall_thickness', 'door_thickness',
				'piece_changes', 'tile_changes'),
			'float' => array('min_zoom', 'max_zoom'),
			'json' => array('background')));

?>
