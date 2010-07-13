<?php

include('db_config.php');
session_start();
if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$table_id = mysqli_real_escape_string($_REQUEST['table_id']);

// STEP 2: Query the Database

$link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
  or die ("Connect failed: " + mysqli_error());
$query = "CALL read_tiles($table_id)";
$result = mysqli_query($link, $query) or die ("Query failed: " + mysqli_error());

// STEP 3: Generate Output

echo "<tiles>\n ";
while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC))
  echo " {$row['fog']}{$row['right_wall']}{$row['bottom_wall']}{$row['image_id']}";
echo "\n</tiles>\n";
?>
