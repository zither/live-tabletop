<?php

include('db_config.php');
include('include/query.php');

session_start();

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
LT_call('update_user_logged_in', $user_id, 0);
$_SESSION = array();

?>
