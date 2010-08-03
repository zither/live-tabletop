<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Query the Database

$result = $LT_SQL->query("CALL read_users()")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('include/users.php');
include('include/xml_headers.php');
echo "<users>\n";
while ($row = $result->fetch_assoc()) {
  LT_write_user_row($row);
}
echo "</users>\n";

?>
