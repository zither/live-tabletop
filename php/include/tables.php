<?php

function LT_write_tables($result) {
  // Set HTTP headers and write doctype for well-formed XML.
  // This must come before any text is written to the document
  // (i.e. before any PHP echo or die statements.)
  include('xml_headers.php');
  // XML requires a single top-level element (document element)
  // so we create a document element named "tables".
  echo "<tables>\n";
  // Create a <table> element for each row of the result set.
  while($row = $result->fetch_assoc()) {
    LT_write_table_row($row);
  }
  echo "</tables>\n";
}

function LT_write_table_row($row) {
  echo "  <table";
  // Convert each column of the row into an XML element attribute.
  foreach ($row as $key => $value) {
    if ($key == 'name' or $key == 'grid_color') {
      // URL-encode strings to be decoded by javascript's decodeURIComponent.
      echo " $key=\"" . rawurlencode($value) . "\"";
    }
    else {
      // Convert integers into strings.
      echo " $key=\"$value\"";
    }
  }
  echo "/>\n";
}

?>
