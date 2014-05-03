<?php // User shares the map with another user

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/permissions.php');

// Interpret the Request

$map = intval($_REQUEST['map']);
$user = intval($_REQUEST['user']);

// Query the Database

if (LT_can_edit_map($map)) LT_call('create_map_owner', $map, $user);

?>
