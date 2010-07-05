<?php

// STEP 1: Interpret the request ($_GET, $_POST, $_REQUEST, $_COOKIE, etc.)

// STEP 2: Query the database (get the $result of calling a MySQL prepared statement)
 
// STEP 3: interpret the result (convert $result into a PHP structure or determine success/failure)

// STEP 4: generate output (echo XML based on PHP structure, or indicate success/failure)

header("Content-Type: text/xml");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // a date in the past
echo '<?xml version="1.0" encoding="utf-8"?>';
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

