<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Query the Database

$rows = LT_call('read_users');

// Generate Output

include('include/users.php');
include('include/xml_headers.php');
echo "<users>\n";
for ($i = 0; $i < count($rows); $i++) {
  LT_write_user_row($rows[$i]);
}
echo "</users>\n";

?>
