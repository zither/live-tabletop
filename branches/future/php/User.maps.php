<?php // User views the maps he owns

include('db_config.php');
include('include/query.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

if (is_array($rows = LT_call('read_maps', intval($_SESSION['user_id']))))
	LT_output_array($rows,
		array('integer' => array('id', 'tile_rows', 'tile_columns')));

?>
