<?php

session_start();

include('db_config.php');
include('include/ownership.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

if (LT_can_modify_table($table_id)) {
  $LT_SQL->query("CALL update_tiles_clear_fog($table_id)")
    or die ("Query failed: " . $LT_SQL->error);
}

?>
