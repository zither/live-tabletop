<?php // User disowns a map or removes another user from the map's owners

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
if (LT_can_edit_map($map))
	if (is_array($rows = LT_call('read_map_owners', $map)))
		LT_output_array($rows,
			array('integer' => array('id'), 'boolean' => array('logged_in')));

?>
