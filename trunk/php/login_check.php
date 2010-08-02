<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);

// Query the Database

$result = $LT_SQL->query("CALL read_user($user_id)")
  or die ("Query failed: " . $LT_SQL->error);

$row = $result->fetch_assoc()
  or die ("Invalid user ID.");

// Generate Output

include('include/xml_headers.php');
echo "<users>\n";
echo "  <user id=\"" . htmlspecialchars($row['id'])
  . "\" name=\"" . htmlspecialchars($row['name'])
  . "\" color=\"" . htmlspecialchars($row['color'])
  . "\" permissions=\"" . htmlspecialchars($row['permissions'])
  . "\"/>\n";
echo "</users>\n";

?>

