<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Query the Database

$result = $LT_SQL->query("CALL read_users()")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('xml_headers.php');
echo "<users>\n";
while ($row = $result->fetch_assoc()) {
  echo "  <user "
    . "id=\"{$row['user_id']}\" "
    . "name=\"{$row['name']}\" "
    . "color=\"{$row['color']}\" "
    . "permissions=\"{$row['permissions']}\"/>\n";
}
echo "</users>\n";

?>
