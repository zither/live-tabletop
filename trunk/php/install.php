<?php

include('users.php');

// STEP 1: Interpret the request

$location = mysqli_real_escape_string($_REQUEST['location']);
$username = mysqli_real_escape_string($_REQUEST['username']);
$password = mysqli_real_escape_string($_REQUEST['password']);
$database = mysqli_real_escape_string($_REQUEST['database']);
$admin_username = mysqli_real_escape_string($_REQUEST['admin_username']);
$admin_password = mysqli_real_escape_string($_REQUEST['admin_password']);

// STEP 2: Query the database

// connect to database
$link = mysqli_connect($location , $username , $password, $database)
  or die('Could not connect: ' . mysqli_error());

// create tables and procedures
$query = file_get_contents('schema.sql');
$error = true;
mysqli_autocommit($link, false);
if (mysqli_multi_query($link, $query)) {
  $error = false;
  do {
    $result = mysqli_store_result($link);
    if (mysqli_errno() != 0) {$error = true; break;}
  } while (mysqli_next_result($link);
}
if ($error) {mysqli_rollback($link); die("Query failed: " . mysqli_error());}
else {mysqli_commit($link);}

// create admin
LT_create_user($admin_username, $admin_password, "administrator")
  or die('Query failed: ' . mysqli_error());

// STEP 3: interpret the result (convert $result into a PHP structure or determine success/failure)

// STEP 4: generate output (echo XML based on PHP structure, or indicate success/failure)

?>
