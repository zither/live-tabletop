<?php // User views a list of this character's owners

include('db_config.php');
include('include/query.php');
include('include/ownership.php');
include('include/output.php');

session_start();
if (!isset($_SESSION['user'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}

$character = intval($_REQUEST['character']);
if (LT_can_view_character($character))
	if (is_array($rows = LT_call('read_character_owners', $character)))
		LT_output_array($rows,
			array('integer' => array('id'), 'boolean' => array('logged_in')));

?>
