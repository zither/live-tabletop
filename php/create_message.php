<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/roll.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$text = $LT_SQL->real_escape_string(LT_expand_rolls($_REQUEST['text']));

// Query the Database

$LT_SQL->query("CALL create_message($table_id, $user_id, '$text')")
  or die ("Query failed: " . $LT_SQL->error);

?>

