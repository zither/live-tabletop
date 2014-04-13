<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
if (strcmp($_SESSION['permissions'], 'administrator') != 0)
  die ("You do not have permission to do this.");

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_REQUEST['id']);
$username = $LT_SQL->real_escape_string($_REQUEST['username']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);
$permissions = $LT_SQL->real_escape_string($_REQUEST['permissions']);

// Query the Database

LT_call('update_user', $user_id, $username, $color, $permissions);

?>
