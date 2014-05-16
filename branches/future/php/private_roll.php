<?php

include('include/roll.php');
include('include/json_headers.php');
echo json_encode(array("time" => time(),
	"text" => LT_expand_rolls($_REQUEST['text'])));

?>

