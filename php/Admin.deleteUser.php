<?php // Admin resets a user's password

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_REQUEST['user']);

// Query the Database

LT_call('delete_user', $user);

?>
