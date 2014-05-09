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

echo json_encode(
	array( // list of 1 messages
		array( // the message as an associative array
//			"user_id" => $_SESSION['user_id'],
			"user_id" => 0,
			"time" => time(),
			"text" => LT_expand_rolls($_REQUEST['text'])
		)
	)
);

?>

