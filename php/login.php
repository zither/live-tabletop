<?php

include('db_config.php');
include('users.php');

// Failure for any reason results in an empty <users></users> document element.
// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

$FAIL = "<users></users>\n";

// STEP 1: Interpret the Request

$username = mysqli_real_escape_string($_REQUEST['username']);
$password = mysqli_real_escape_string($_REQUEST['password']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die($FAIL);

$query = "CALL get_user_by_name($username)";
$result = mysqli_query($query) or die($FAIL);
 
// STEP 3: Interpret the Result

$row = mysqli_fetch_array($result, MYSQLI_ASSOC)) or die($FAIL);
$hash = LT_hash_password($password, $row['salt']);
if (strcmp($hash, $row['hash']) != 0) die ($FAIL);

// STEP 4: Save session variables that only the server can modify

session_start();
$_SESSION['user_id'] = $row['user_id'];
$_SESSION['permissions'] = $row['permissions'];

// STEP 5: Generate Output

echo "<users>\n"
   . "  <user id=\"{$row['user_id']}\" name=\"{$row['name']}\""
   .     " color=\"{$row['color']}\" permissions=\"{$row['permissions']}\"/>\n"
   . "</users>\n";

?>

