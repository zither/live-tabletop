<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$rows = LT_call('read_tables_by_user_id', $user_id);

// Generate Output

include('include/tables.php');
LT_write_tables($rows);

?>
