<?php

include('db_config.php');
include('roll.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

$text = mysqli_real_escape_string($_REQUEST['text']);

include('xml_headers.php');
?>
<messages>
  <message user_id="" time="">
    I cast Arcane Projectile, rolling 
    &lt;span title="d20 + 8"&gt;17&lt;/span&gt;
    to hit and
    &lt;span title="2d4 + 1"&gt;5&lt;/span&gt;
    for damage.resulting value.
    This is not your actual roll, just a stub.
  </message>
</messages>

