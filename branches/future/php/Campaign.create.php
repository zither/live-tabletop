<?php // User creates a new campaign

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

// Query the Database

$rows = LT_call('create_campaign', $user_id, $name);

include('include/json_headers.php');
echo json_encode(array('id' => integer($rows[0]['id'])));

?>
