<?php

session_start();

include('db_config.php');
include('include/images.php');
include('include/ownership.php');

// Interpret the Request

$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);

// Query the Database

if (LT_can_modify_image($image_id)) {
  $result = $LT_SQL->query("CALL read_image($image_id)")
    or die ("Query error: " . $LT_SQL->error);
  $row = $result->fetch_assoc();
  $type = $row['type'];
  $file = $row['file'];
  $LT_SQL->query("CALL delete_image($image_id)")
    or die ("Query error: " . $LT_SQL->error);
  unlink(LT_image_path($type, $file))
    or die ("Unlink failed.");
}

?>
