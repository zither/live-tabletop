<?php // User disowns a map or removes another user from the map's owners

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

// Interpret the Request

$map = intval($_REQUEST['map']);
$user = intval($_REQUEST['user']);

// Query the Database

if (LT_can_edit_map($map)) LT_call('delete_map_owner', $map, $user);

?>
