<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$piece_rows = LT_call('read_pieces', $table_id);
$pieces = array();
for ($i = 0; $i < count($piece_rows); $i++) {
  $pieces[] = array('stats' => array(), 'attributes' => $piece_rows[$i]);
  $piece_id = $piece_rows[$i]['id'];
  $stat_rows = LT_call('get_stats', $piece_id);
  for ($j = 0; $j < count($stat_rows); $j++) {
    $name = $stat_rows[$j]['name'];
    $value = $stat_rows[$j]['value'];
    $pieces[$i]['stats'][$name] = $value;
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
