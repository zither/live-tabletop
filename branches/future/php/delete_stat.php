<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$piece_id = $LT_SQL->real_escape_string($_REQUEST['piece_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);

// Query the Database

if (LT_can_modify_piece($piece_id)) {
  LT_call('delete_stat', $piece_id, $name);
}

?>
