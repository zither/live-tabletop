<?php

session_start();

include('db_config.php');
include('users.php');

// Failure for any reason results in an empty <users></users> document element.
// We return same failure result regardless of the reason for failure so that
// we don't help password crackers figure out if they got the wrong password
// or the wrong username or the wrong argument names.

// Interpret the Request

$username = $LT_SQL->real_escape_string($_REQUEST['username']);
$password = $LT_SQL->real_escape_string($_REQUEST['password']);

// Query the Database and Generate Output

include('xml_headers.php');
echo "<users>\n";
if ($result = $LT_SQL->query("CALL read_user_by_name('$username')")) {
  if ($row = $result->fetch_assoc()) {
    $hash = LT_hash_password($password, $row['salt']);
    if (strcmp($hash, $row['hash']) == 0) {
      // Save session variables that only the server can modify
      $_SESSION['user_id'] = $row['user_id'];
      $_SESSION['permissions'] = $row['permissions'];
      echo "  <user id=\"{$row['user_id']}\" name=\"{$row['name']}\" "
        . "color=\"{$row['color']}\" permissions=\"{$row['permissions']}\"/>\n";
    }
  }
}
echo "</users>\n";

?>

