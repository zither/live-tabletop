<?php

include('db_config.php');
include('include/query.php');

session_start();

if (isset($_SESSION['user']))
	LT_call('update_user_logged_in', intval($_SESSION['user']), 0);
$_SESSION = array();

?>
