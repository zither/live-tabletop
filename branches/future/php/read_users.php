<?php

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Query the Database

$rows = LT_call('read_users');

// Generate Output

include('include/users.php');
LT_write_users($rows);

?>
