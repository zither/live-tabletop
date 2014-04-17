<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$rows = LT_call('read_table', $table_id);

// Generate Output

include('include/tables.php');
LT_write_tables($rows);

?>
