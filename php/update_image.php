<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/ownership.php');

// Interpret the Request

$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);
$user_id = $LT_SQL->real_escape_string($_REQUEST['user_id']);
$public = $LT_SQL->real_escape_string($_REQUEST['public']);

// Query the Database

if (LT_can_modify_image($image_id)) {
  LT_call('update_image', $image_id, $user_id, $public);
}

?>
