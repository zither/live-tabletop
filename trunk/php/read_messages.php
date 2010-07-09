<?php

include('db_config.php');
include('roll.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

$table_id = mysqli_real_escape_string($_REQUEST['table_id']);

echo "<messages>\n";
if ($link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)) {
  if ($result = mysqli_query($link, "CALL read_messages($table_id)")) {
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
      echo "  <message user_id=\"{$row['user_id']}\" time=\"{$row['time']}\">"
        . htmlspecialchars($row['text']) . "</message>\n";
    }
  }
}
echo "</messages>\n";

?>
