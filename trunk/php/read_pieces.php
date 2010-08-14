<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$LT_SQL->multi_query("CALL read_pieces($table_id)")
  or die ("Query failed: " . $LT_SQL->error);
$result = $LT_SQL->store_result();
$pieces = array();
while ($row = $result->fetch_assoc()) {
  $pieces[] = array('stats' => array(), 'attributes' => $row);
}
$result->close();
if ($LT_SQL->more_results()) {
  while($LT_SQL->next_result());
}

for ($i = 0; $i < count($pieces); $i++) {
  $piece_id = $pieces[$i]['attributes']['id'];
  $LT_SQL->multi_query("CALL get_stats($piece_id)")
    or die ("Query failed: " . $LT_SQL->error);
  $result = $LT_SQL->store_result();
  while ($row = $result->fetch_assoc()) {
    $pieces[$i]['stats'][$row['name']] = $row['value'];
  }
  $result->close();
  if ($LT_SQL->more_results()) {
    while($LT_SQL->next_result());
  }
}

// Generate Output

include('include/xml_headers.php');
echo "<pieces>\n";
for ($i = 0; $i < count($pieces); $i++) {
  echo "  <piece";
  foreach ($pieces[$i]['attributes'] as $key => $value) {
    if ($key == 'name' or $key == 'color') {
      // URL-encode strings to be decoded by javascript's decodeURIComponent.
      echo " $key=\"" . rawurlencode($value) . "\"";
    }
    else {
      // Encode integers as strings.
      echo " $key=\"$value\"";
    }
  }
  echo ">\n";
  foreach ($pieces[$i]['stats'] as $key => $value) {
    // URL-encode strings to be decoded by javascript's decodeURIComponent.
    echo "    <stat name=\"" . rawurlencode($key) . "\">"
      . rawurlencode($value) . "</stat>\n";
  }
  echo "  </piece>\n";
}
echo "</pieces>\n";

?>
