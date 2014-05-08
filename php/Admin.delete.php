<?php // Admin deletes his admin account or another admin account

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$login = $LT_SQL->real_escape_string($_REQUEST['login']);

// Query the Database

LT_call('delete_admin', $login);

?>
