<?php // Admin deletes old messages

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

LT_call('delete_messages_expired');

?>
