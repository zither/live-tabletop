<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);

// Query the Database

$result = $LT_SQL->query("CALL read_images('$type')")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('include/xml_headers.php');
echo "<images>\n";
while($row = $result->fetch_assoc()) {
  echo "  <image"
    // Encode integers as strings.
    . " id=\"{$row['id']}\""
    . " user_id=\"{$row['user_id']}\""
    . " public=\"{$row['public']}\""
    . " time=\"{$row['time']}\""
    // URL-encode strings to be decoded by javascript's decodeURIComponent.
    . " file=\"" . rawurlencode($row['file']) . "\""
    . " type=\"" . rawurlencode($row['type']) . "\""
    . "/>\n";
}
echo "</images>\n";

?>
