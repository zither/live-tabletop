<?php // User updates his account information

session_start();
if (!isset($_SESSION['user_id'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

// Interpret the Request

$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
$name = $LT_SQL->real_escape_string($_REQUEST['name']);
$color = $LT_SQL->real_escape_string($_REQUEST['color']);
$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$subscribed = intval($_REQUEST['subscribed']);

// Query the Database

LT_call('update_user', $user_id, $name, $color, $email, $subscribed);

?>
