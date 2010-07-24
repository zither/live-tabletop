<?php

session_start();
// if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
include('roll.php');
include('xml_headers.php');
echo "<messages>\n"
  .  "  <message user_id=\"{$_SESSION['user_id']}\" time=\"" . time() . "\">\n"
  .  "    " . rawurlencode(LT_expand_rolls($_REQUEST['text'])) . "\n"
  .  "  </message>\n"
  .  "</messages>\n";

?>

