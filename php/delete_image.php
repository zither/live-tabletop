<?php

session_start();

include('db_config.php');
include('include/query.php');
include('include/images.php');
include('include/ownership.php');

// Interpret the Request

$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);

// Query the Database

if (LT_can_modify_image($image_id)) {
  $rows = LT_call("read_image", $image_id);
  $type = $rows[0]['type'];
  $file = $rows[0]['file'];
  LT_call("delete_image", $image_id);
  unlink(LT_image_path($type, $file))
    or die ("Unlink failed.");
}

?>
