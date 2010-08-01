<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$result = $LT_SQL->query("CALL read_table('$table_id')")
  or die ("Query failed: " . $LT_SQL->error);

// Generate Output

include('include/xml_headers.php');
echo "<tables>\n";
while($row = $result->fetch_assoc()) {
  echo "  <table";
  foreach ($row as $key => $value) {
    echo " $key=\"" . htmlspecialchars($value) . "\"";
  }
  echo "/>\n";
}
echo "</tables>\n";

?>
