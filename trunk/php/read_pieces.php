<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');

// Interpret the Request

$table_id = $LT_SQL->real_escape_string($_REQUEST['table_id']);

// Query the Database

$result = $LT_SQL->query("CALL read_pieces($table_id)")
  or die ("Query failed: " . $LT_SQL->error);
$pieces = array();
while ($row = $result->fetch_assoc()) {
  $pieces[] = array(
    'stats' => array(),
    'attributes' => array(
      'id' => $row['piece_id'],
      'table' => $row['table_id'],
      'image' => $row['image_id'],
      'user' => $row['user_id'],
      'name' => $row['name'],
      'x' => $row['x'],
      'y' => $row['y'],
      'x_offset' => $row['x_offset'],
      'y_offset' => $row['y_offset'],
      'width' => $row['width'],
      'height' => $row['height'],
      'color' => $row['color']));
}

for ($i = 0; $i < count($pieces); $i++) {
  $piece_id = $pieces[$i]['attributes']['id'];
  $result = $LT_SQL->query("CALL get_stats($piece_id)")
    or die ("Query failed: " . $LT_SQL->error);
  while ($row = $result->fetch_assoc()) {
    $pieces[$i]['stats'][$row['name']] = $row['value'];
  }
}

// Generate Output

include('include/xml_headers.php');
echo "<pieces>\n";
for ($i = 0; $i < count($pieces); $i++) {
  echo "  <piece";
  foreach ($pieces[$i]['attributes'] as $name => $value) {
    echo " $name=\"$value\"";
  }
  echo ">\n";
  foreach ($pieces[$i]['stats'] as $name => $value) {
    echo "    <stat name=\"$name\">$value</stat>\n";
  }
  echo "  </piece>\n";
}
echo "</pieces>\n";

?>
