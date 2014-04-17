<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  LT_call('delete_table', $table_id);
}

?>
