<?php

include('db_config.php');
include('users.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

echo "<users>\n";
if ($link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)) {
  if ($result = mysqli_query($link, "CALL read_users()") {
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
      echo "  <user "
        . "id=\"{$row['user_id']}\" "
        . "name=\"{$row['name']}\" "
        . "color=\"{$row['color']}\" "
        . "permissions=\"{$row['permissions']}\"/>\n";
    }
  }
}
echo "</users>\n";

?>
