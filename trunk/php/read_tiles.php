<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$rows = LT_call('read_tiles', $table_id);

// Generate Output

$images = array();
$fog = "";
foreach ($rows as $tile) {
	$images[] = intval($tile['image_id']);
	$fog .= $tile['fog'];
}
include('include/json_headers.php');
echo json_encode(array('fog' => $fog, 'images' => $images));

?>
