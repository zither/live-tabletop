<?php

session_start();
// if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);

// Query the Database

$rows = LT_call('read_images', $type);

// Generate Output

include('include/xml_headers.php');
echo "<images>\n";
for ($i = 0; $i < count($rows); $i++) {
  echo "  <image"
    // Encode integers as strings.
    . " id=\"{$rows[$i]['id']}\""
    . " user_id=\"{$rows[$i]['user_id']}\""
    . " public=\"{$rows[$i]['public']}\""
    . " time=\"{$rows[$i]['time']}\""
    . " width=\"{$rows[$i]['width']}\""
    . " height=\"{$rows[$i]['height']}\""
    . " tile_width=\"{$rows[$i]['tile_width']}\""
    . " tile_height=\"{$rows[$i]['tile_height']}\""
    . " center_x=\"{$rows[$i]['center_x']}\""
    . " center_y=\"{$rows[$i]['center_y']}\""
    . " layer=\"{$rows[$i]['layer']}\""
    // URL-encode strings to be decoded by javascript's decodeURIComponent.
    . " file=\"" . rawurlencode($rows[$i]['file']) . "\""
    . " type=\"" . rawurlencode($rows[$i]['type']) . "\""
    . " tile_mode=\"" . rawurlencode($rows[$i]['tile_mode']) . "\""
    . "/>\n";
}
echo "</images>\n";

?>
