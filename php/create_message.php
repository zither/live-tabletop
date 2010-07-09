<?php

include('db_config.php');
include('roll.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$user_id = mysqli_real_escape_string($_SESSION['user_id']);
$table_id = mysqli_real_escape_string($_REQUEST['table_id']);
$text = mysqli_real_escape_string(LT_expand_rolls($_REQUEST['text']));

// STEP 2: Query the Database

if ($link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)) {
  mysqli_query($link, "CALL create_message($table_id, $user_id, '$text')");
}

?>

