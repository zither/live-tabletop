<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$x = $LT_SQL->real_escape_string($_REQUEST['x']);
$y = $LT_SQL->real_escape_string($_REQUEST['y']);
$direction = $LT_SQL->real_escape_string($_REQUEST['direction']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  LT_call('delete_wall', $table_id, $x, $y, $direction);
}

?>
