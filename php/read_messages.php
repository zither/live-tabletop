<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$last_message = $LT_SQL->real_escape_string($_REQUEST['last_message']);

// Query the Database

$rows = LT_call('read_messages', $table_id, $last_message);

// Generate Output

include('include/xml_headers.php');
echo "<messages>\n";
for ($i = 0; $i < count($rows); $i++) {
  echo "  <message"
    . " id=\"{$rows[$i]['id']}\""
    . " user_id=\"{$rows[$i]['user_id']}\""
    . " time=\"{$rows[$i]['time']}\">"
    . rawurlencode($rows[$i]['text'])
    . "</message>\n";
}
echo "</messages>\n";

?>
