<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$rows = LT_call('read_user', $user_id);

if (count($rows) == 0) die ("Invalid user ID.");

// Generate Output

include('include/users.php');
include('include/xml_headers.php');
echo "<users>\n";
LT_write_user_row($rows[0]);
echo "</users>\n";

?>

