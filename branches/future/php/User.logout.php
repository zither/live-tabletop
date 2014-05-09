<?php

include('db_config.php');
include('include/query.php');

session_start();

LT_call('update_user_logged_in', intval($_SESSION['user_id']), 0);
$_SESSION = array();

?>
