<?php

include('include/roll.php');
include('include/json_headers.php');

/*
session_start();
if (!isset($_SESSION['user_id'])) {
	header('HTTP/1.1 401 Unauthorized', true, 401);
	exit('You are not logged in.');
}
*/

//echo json_encode(array("user_id" => SESSION['user_id'], "time" => time(),
echo json_encode(array("time" => time(),
	"text" => LT_expand_rolls($_REQUEST['text'])));

?>

