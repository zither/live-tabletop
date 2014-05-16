<?php // User loads a map or refreshes an updated map

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$map = intval($_REQUEST['map']);
if (LT_can_view_map($map))
	if (is_array($rows = LT_call('read_pieces', $map)))
		LT_output_array($rows, array(
			'integer' => array('id', 'map_id', 'character_id'),
			'json' => array('image', 'markers'),
			'float' => array('x', 'y'),
			'boolean' => array('locked')));

?>
