<?php

session_start();
// if (!isset($_SESSION['user_id'])) die ('You are not logged in.');
include('include/roll.php');
include('include/json_headers.php');
echo json_encode(
	array( // list of 1 messages
		array( // the message as an associative array
			"user_id" => $_SESSION['user_id'],
			"time" => time(),
			"text" => LT_expand_rolls($_REQUEST['text'])
		)
	)
);

?>

