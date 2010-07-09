<?php

include('db_config.php');
include('roll.php');
session_start();

if (!isset($_SESSION['user_id'])) die('You are not logged in.');

// STEP 1: Interpret the Request

$text = mysqli_real_escape_string($_REQUEST['text']);

// STEP 2: Query the Database

// STEP 3: Interpret the Result

include('xml_headers.php');

// STEP 4: Generate Output
?>
Your message was recieved, but not really, because this is just a stub.

