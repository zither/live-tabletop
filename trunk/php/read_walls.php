<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$rows = LT_call('read_walls', $table_id);

// Generate Output

include('include/xml_headers.php');
echo "<walls>\n ";
for ($i = 0; $i < count($rows); $i++) {
  // URL-encode strings to be decoded by javascript's decodeURIComponent.
  echo "  <wall"
    . ' x="' . $rows[$i]['x'] . '"'
    . ' y="' . $rows[$i]['y'] . '"'
    . ' direction="' . rawurlencode($rows[$i]['direction']) . '"'
    . ' contents="' . rawurlencode($rows[$i]['contents']) . '"'
    . "/>\n";
}
echo "\n</walls>\n";
?>
