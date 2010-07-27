<?php

session_start();

include('db_config.php');
include('include/ownership.php');

// Interpret the Request

$piece_id = $LT_SQL->real_escape_string($_REQUEST['piece_id']);

// Query the Database

if (LT_can_modify_piece($piece_id)) {
  $LT_SQL->query("CALL delete_piece($piece_id)")
    or die ("Query failed: " . $LT_SQL->error);
}

?>
