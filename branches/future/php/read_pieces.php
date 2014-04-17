<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$string_fields = array('name', 'color');
$piece_rows = LT_call('read_pieces', $table_id);
foreach ($piece_rows as $i => $peice) {
	foreach ($piece as $key => $value)
		if (!in_array($key, $string_fields))
			$piece_rows[$i][$key] = intval($value);
	$stat_rows = LT_call('get_stats', $piece['id']);
	$piece_rows[$i]['stats'] = array();
	foreach ($stat_rows as $stat)
		$piece_rows[$i]['stats'][$stat['name']] = $stat['value'];
}

// Generate Output

include('include/json_headers.php');
echo json_encode($piece_rows);

?>
