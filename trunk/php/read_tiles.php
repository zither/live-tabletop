<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$rows = LT_call('read_tiles', $table_id);

// Generate Output

include('include/xml_headers.php');
echo "<tiles>\n ";
for ($i = 0; $i < count($rows); $i++) {
  $t = $rows[$i];
  echo " {$t['fog']}{$t['image_id']}";
}
echo "\n</tiles>\n";
?>
