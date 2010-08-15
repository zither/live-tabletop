<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$time = $LT_SQL->real_escape_string($_REQUEST['time']);

// Query the Database

$rows = LT_call('read_messages', $table_id, $time);

// Generate Output

include('include/xml_headers.php');
echo "<messages>\n";
for ($i = 0; $i < count($rows); $i++) {
  echo "  <message"
    . " user_id=\"{$rows[$i]['user_id']}\""
    . " time=\"{$rows[$i]['time']}\">"
    . rawurlencode($rows[$i]['text'])
    . "</message>\n";
}
echo "</messages>\n";

?>
