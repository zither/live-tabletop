<?php // Admin views all users

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');
include('include/password.php');

// Interpret the Request

// Query the Database

LT_call('read_users');

?>
