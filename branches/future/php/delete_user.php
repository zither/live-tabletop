<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_REQUEST['user_id']);

// Query the Database

LT_call('delete_user', $user_id);

?>

