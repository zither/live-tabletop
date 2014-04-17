<?php

if (file_exists('db_config.php')) die ("Live Tabletop is already installed.");

include('include/users.php');


// Interpret the Request

$location = $_REQUEST['location'];
$username = $_REQUEST['username'];
$password = $_REQUEST['password'];

$LT_SQL = new mysqli($location, $username, $password);
if ($LT_SQL->connect_errno != 0) die('Could not connect.');

$database = $LT_SQL->real_escape_string($_REQUEST['database']);
$admin_username = $LT_SQL->real_escape_string($_REQUEST['admin_username']);
$admin_password = $LT_SQL->real_escape_string($_REQUEST['admin_password']);

$LT_SQL->query("CREATE DATABASE IF NOT EXISTS $database")
  or die ("Query failed: "  . $LT_SQL->error);

$LT_SQL->query("USE $database")
  or die ("Query failed: "  . $LT_SQL->error);

  
// Create the Database Schema (tables and stored procedures)

$LT_SQL->autocommit(FALSE);
if ($LT_SQL->multi_query(file_get_contents('include/schema.sql'))) {
  do {
    $result = $LT_SQL->store_result();
    if ($LT_SQL->errno != 0) {
      $LT_SQL->rollback();
      die("Query failed: " . $LT_SQL->error);
    }
  } while ($LT_SQL->next_result());
  $LT_SQL->commit();
}
else {
  $LT_SQL->rollback();
  die("Query failed: " . $LT_SQL->error);
}


// Create an Administrator Account

$salt = LT_random_salt();
$hash = LT_hash_password($admin_password, $salt);
$query = "CALL create_user('$admin_username', '$hash', '$salt', NULL, 'administrator')";
$LT_SQL->query($query) or die('Query failed: ' . $LT_SQL->error);
$LT_SQL->commit();


// Create db_config.php
file_put_contents('db_config.php',
  "<?php\n"
  . "\t\$LT_SQL = new mysqli('$location', '$username', '$password', '$database');\n"
  . "?>\n");

?>

