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
    . " id=\"{$row['image_id']}\""
    . " user=\"{$row['user_id']}\""
    . " file=\"{$row['file']}\""
    . " type=\"{$row['type']}\""
    . " public=\"{$row['public']}\""
    . " time=\"{$row['time']}\""
    . "/>\n";
}
echo "</images>\n";

?>
