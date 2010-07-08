<?php

if (file_exists('db_config.php')) die ("Live Tabletop is already installed.");

include('users.php');

// STEP 1: Interpret the Request

$DBLocation = mysqli_real_escape_string($_REQUEST['location']);
$DBUsername = mysqli_real_escape_string($_REQUEST['username']);
$DBPassword = mysqli_real_escape_string($_REQUEST['password']);
$DBName = mysqli_real_escape_string($_REQUEST['database']);
$admin_username = mysqli_real_escape_string($_REQUEST['admin_username']);
$admin_password = mysqli_real_escape_string($_REQUEST['admin_password']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die('Could not connect: ' . mysqli_error());

mysqli_autocommit($link, false);
if (mysqli_multi_query($link, file_get_contents('schema.sql'))) {
  do {
    $result = mysqli_store_result($link);
    if (mysqli_errno() != 0) {
      mysqli_rollback($link);
      die("Query failed: " . mysqli_error());
    }
  } while (mysqli_next_result($link);
  mysqli_commit($link);
}
else {
  mysqli_rollback($link);
  die("Query failed: " . mysqli_error());
}

LT_create_user($admin_username, $admin_password, "administrator")
  or die('Query failed: ' . mysqli_error());

// STEP 3: Create db_config.php
file_put_contents('db_config.php',
  "<?php\n"
  . "\$DBLocation = $DBLocation;\n"
  . "\$DBUsername = $DBUsername;\n"
  . "\$DBPassword = $DBPassword;\n"
  . "\$DBName = $DBName;\n"
  . "?>\n";

?>
