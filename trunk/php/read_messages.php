<?php

session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

include('db_config.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);
$time = $LT_SQL->real_escape_string($_REQUEST['time']);

// Query the Database

$result = $LT_SQL->query("CALL read_messages($table_id, '$time')")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('xml_headers.php');
echo "<messages>\n";
while ($row = $result->fetch_assoc()) {
  echo "  <message user_id=\"{$row['user_id']}\" time=\"{$row['time']}\">"
    . rawurlencode($row['text']) . "</message>\n";
}
echo "</messages>\n";

?>
